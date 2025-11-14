export default function jwtDecode(token: string | null) {
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const decodedString =
      typeof atob === 'function'
        ? atob(payload)
        : (
            globalThis as {
              Buffer?: {
                from: (
                  input: string,
                  encoding: string
                ) => { toString: (encoding: string) => string };
              };
            }
          ).Buffer?.from(payload, 'base64').toString('utf-8');
    if (!decodedString) return null;
    const decoded = JSON.parse(decodedString);
    return {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      fullName: decoded.fullName,
    };
  } catch {
    return null;
  }
}
