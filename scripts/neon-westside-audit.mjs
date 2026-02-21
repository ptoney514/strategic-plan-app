import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('Missing DATABASE_URL in environment.');
  process.exit(1);
}

const sql = neon(databaseUrl);
const westsideSlug = process.env.AUDIT_DISTRICT_SLUG || 'westside';
const westsideAdminEmail = process.env.AUDIT_ADMIN_EMAIL || 'admin@westside66.org';
const objectiveId = process.env.AUDIT_OBJECTIVE_ID || 'b0000001-0000-0000-0000-000000000000';

async function run() {
  const [org] = await sql`
    select id, slug, name, is_public, is_active
    from organizations
    where slug = ${westsideSlug}
    limit 1
  `;

  const membership = await sql`
    select u.email, om.role, om.organization_id
    from organization_members om
    join "user" u on u.id = om.user_id
    join organizations o on o.id = om.organization_id
    where o.slug = ${westsideSlug}
      and u.email = ${westsideAdminEmail}
  `;

  const [counts] = await sql`
    select
      (select count(*)::int from plans p where p.organization_id = ${org?.id || null}) as plan_count,
      (select count(*)::int
        from goals g
        join plans p on p.id = g.plan_id
        where p.organization_id = ${org?.id || null}) as goal_count,
      (select count(*)::int
        from metrics m
        join goals g on g.id = m.goal_id
        join plans p on p.id = g.plan_id
        where p.organization_id = ${org?.id || null}) as metric_count
  `;

  const metricColumnTypes = await sql`
    select column_name, data_type, udt_name
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'metrics'
      and column_name in ('current_value', 'target_value', 'decimal_places')
    order by column_name
  `;

  const [numericShape] = await sql`
    select
      count(*)::int as metrics_total,
      count(*) filter (where m.current_value is not null)::int as current_value_non_null,
      count(*) filter (
        where m.current_value is not null
          and m.current_value ~ '^-?[0-9]+(\\.[0-9]+)?$'
      )::int as current_value_numeric_like,
      count(*) filter (where m.target_value is not null)::int as target_value_non_null,
      count(*) filter (
        where m.target_value is not null
          and m.target_value ~ '^-?[0-9]+(\\.[0-9]+)?$'
      )::int as target_value_numeric_like
    from metrics m
    join goals g on g.id = m.goal_id
    join plans p on p.id = g.plan_id
    join organizations o on o.id = p.organization_id
    where o.slug = ${westsideSlug}
  `;

  const objectiveMetrics = await sql`
    select
      m.id,
      m.metric_name,
      m.metric_type,
      m.current_value,
      m.target_value,
      m.decimal_places,
      jsonb_typeof(m.visualization_config -> 'currentValue') as viz_current_value_type,
      m.visualization_config ->> 'currentValue' as viz_current_value,
      jsonb_typeof(m.visualization_config -> 'targetValue') as viz_target_value_type,
      m.visualization_config ->> 'targetValue' as viz_target_value
    from metrics m
    where m.goal_id = ${objectiveId}
    order by m.order_position nulls last, m.created_at
  `;

  const objectiveTreeMetrics = await sql`
    with recursive tree as (
      select g.id, g.parent_id, g.goal_number, g.title, g.level
      from goals g
      where g.id = ${objectiveId}
      union all
      select g2.id, g2.parent_id, g2.goal_number, g2.title, g2.level
      from goals g2
      join tree t on g2.parent_id = t.id
    )
    select
      t.id as goal_id,
      t.goal_number,
      t.title as goal_title,
      t.level as goal_level,
      m.id as metric_id,
      m.metric_name,
      m.metric_type,
      m.current_value,
      m.target_value,
      m.decimal_places,
      jsonb_typeof(m.visualization_config -> 'currentValue') as viz_current_value_type,
      m.visualization_config ->> 'currentValue' as viz_current_value,
      jsonb_typeof(m.visualization_config -> 'targetValue') as viz_target_value_type,
      m.visualization_config ->> 'targetValue' as viz_target_value
    from tree t
    left join metrics m on m.goal_id = t.id
    where m.id is not null
    order by t.goal_number, m.order_position nulls last, m.created_at
  `;

  const sampleNonNumericCurrent = await sql`
    select
      m.id,
      m.metric_name,
      m.current_value,
      m.target_value
    from metrics m
    join goals g on g.id = m.goal_id
    join plans p on p.id = g.plan_id
    join organizations o on o.id = p.organization_id
    where o.slug = ${westsideSlug}
      and m.current_value is not null
      and not (m.current_value ~ '^-?[0-9]+(\\.[0-9]+)?$')
    limit 20
  `;

  const payload = {
    auditedAt: new Date().toISOString(),
    districtSlug: westsideSlug,
    organization: org || null,
    westsideAdminMembership: membership,
    totals: counts || null,
    metricColumnTypes,
    numericShape: numericShape || null,
    objectiveId,
    objectiveMetrics,
    objectiveTreeMetrics,
    sampleNonNumericCurrent,
  };

  console.log(JSON.stringify(payload, null, 2));
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
