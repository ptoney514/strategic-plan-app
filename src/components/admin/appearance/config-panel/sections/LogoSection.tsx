import { useAppearance } from '../../AppearanceContext';
import { LogoUpload } from '../../../LogoUpload';

export function LogoSection() {
  const { state, dispatch } = useAppearance();

  return (
    <LogoUpload
      currentUrl={state.logoUrl}
      onUpload={(url) => dispatch({ type: 'SET_LOGO_URL', payload: url })}
      onRemove={() => dispatch({ type: 'SET_LOGO_URL', payload: '' })}
      folder="district-logos"
      label="District Logo"
      helpText="PNG, JPG, SVG or WebP. Max 5MB."
    />
  );
}
