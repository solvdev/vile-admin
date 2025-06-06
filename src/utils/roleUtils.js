export const isAdmin = (user) => {
    return user?.is_superuser || user?.roles?.includes('admin');
  };
  
  export const isCoach = (user) => {
    return user?.roles?.includes('coach');
  };
  
  export const isSecretaria = (user) => {
    return user?.roles?.includes('secretaria');
  };
  