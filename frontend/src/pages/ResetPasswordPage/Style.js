export const colors = {
  primary: '#10B981',
  primarySoft: '#34D399',
  background: '#F8FAFC',
  text: '#1E293B',
  muted: '#64748B',
};

export const styles = {
  wrapper: {
    minHeight: '100vh',
    padding: '40px 16px',
    background: 'radial-gradient(circle at 15% 20%, #D1FAE5 0%, #F8FAFC 35%, #ECFDF5 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  card: {
    width: '100%',
    maxWidth: '960px',
    borderRadius: '22px',
    overflow: 'hidden',
    background: '#ffffff',
    boxShadow: '0 25px 60px rgba(16, 185, 129, 0.15)',
  },

  showcase: {
    height: '100%',
    padding: '48px 38px',
    background: 'linear-gradient(140deg, #059669 0%, #10B981 45%, #34D399 100%)',
    color: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },

  showcaseTitle: {
    margin: 0,
    color: '#ffffff',
    fontSize: '34px',
    lineHeight: 1.15,
    fontWeight: 700,
    letterSpacing: '0.4px',
  },

  showcaseText: {
    display: 'block',
    marginTop: '14px',
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: '15px',
  },

  statBox: {
    padding: '18px 20px',
    borderRadius: '14px',
    background: 'rgba(255, 255, 255, 0.16)',
    border: '1px solid rgba(255, 255, 255, 0.22)',
    backdropFilter: 'blur(2px)',
  },

  formSide: {
    height: '100%',
    padding: '40px 34px',
  },

  subtitle: {
    display: 'block',
    color: colors.muted,
    marginTop: '-6px',
    marginBottom: '24px',
    fontSize: '14px',
  },

  submitButton: {
    height: '48px',
    borderRadius: '12px',
    marginTop: '8px',
    fontWeight: 600,
    background: colors.primary,
    borderColor: colors.primary,
  },

  forgot: {
    marginTop: '14px',
    textAlign: 'right',
    fontSize: '14px',
  },

  register: {
    marginTop: '26px',
    textAlign: 'center',
    color: colors.muted,
    fontSize: '14px',
  },

  link: {
    color: colors.primary,
    fontWeight: 600,
    cursor: 'pointer'
  },
};
