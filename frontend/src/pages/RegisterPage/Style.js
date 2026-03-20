export const colors = {
  primary: '#0F766E',
  secondary: '#0EA5A4',
  accent: '#F97316',
  background: '#F0FDFA',
  text: '#0F172A',
  muted: '#64748B',
};

export const styles = {
  wrapper: {
    minHeight: '100vh',
    padding: '36px 16px',
    background: 'radial-gradient(circle at 75% 8%, #CCFBF1 0%, #F0FDFA 42%, #ECFEFF 100%)',
  },

  card: {
    maxWidth: '980px',
    margin: '0 auto',
    borderRadius: '24px',
    overflow: 'hidden',
    background: '#ffffff',
    boxShadow: '0 26px 64px rgba(15, 118, 110, 0.16)',
  },

  hero: {
    height: '100%',
    padding: '46px 34px',
    color: '#ffffff',
    background: 'linear-gradient(145deg, #115E59 0%, #0F766E 55%, #0EA5A4 100%)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },

  heroTitle: {
    margin: 0,
    color: '#ffffff',
    fontSize: '34px',
    lineHeight: 1.15,
    fontWeight: 700,
  },

  heroText: {
    display: 'block',
    marginTop: '12px',
    color: 'rgba(255, 255, 255, 0.86)',
    fontSize: '15px',
  },

  heroList: {
    marginTop: '16px',
    paddingLeft: '16px',
    color: '#ffffff',
    opacity: 0.92,
    lineHeight: 1.9,
    fontSize: '14px',
  },

  panel: {
    padding: '34px 30px',
  },

  panelSubtitle: {
    display: 'block',
    color: colors.muted,
    marginTop: '-6px',
    marginBottom: '18px',
  },

  passwordNote: {
    fontSize: '12px',
    color: colors.muted,
  },

  backButton: {
    height: '46px',
    borderRadius: '12px',
    fontWeight: 600,
    borderColor: '#99F6E4',
    color: colors.primary,
  },

  submitButton: {
    height: '46px',
    borderRadius: '12px',
    fontWeight: 600,
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
};