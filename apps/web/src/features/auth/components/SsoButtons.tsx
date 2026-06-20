export function SsoButtons() {
  const startSso = (provider: "microsoft" | "google") => {
    window.location.assign(`/api/v1/auth/sso/${provider}/start`);
  };

  return (
    <>
      <div className="auth-divider">
        <span>or continue with SSO</span>
      </div>
      <div className="sso-buttons">
        <button type="button" onClick={() => startSso("microsoft")}>
          <span className="microsoft-mark">
            <i />
            <i />
            <i />
            <i />
          </span>
          Microsoft
        </button>
        <button type="button" onClick={() => startSso("google")}>
          <span className="google-mark">G</span>
          Google
        </button>
      </div>
    </>
  );
}
