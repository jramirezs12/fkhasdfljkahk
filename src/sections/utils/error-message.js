export function getErrorMessage(error) {
  if (error instanceof Error) {
    return error.message || error.name || 'Se produjo un error';
  }

  if (typeof error === 'string') {
    return error;
  }

  if (typeof error === 'object' && error !== null) {
    const errorMessage = error.message;
    if (typeof errorMessage === 'string') {
      return errorMessage;
    }
  }

  return `Error desconocido: ${error}`;
}