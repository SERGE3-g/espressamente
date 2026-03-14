// Maps routes to allowed roles. Routes not listed here are accessible to all authenticated users.
const ROUTE_ROLES: Record<string, string[]> = {
  "/categorie": ["SUPER_ADMIN", "STORE_MANAGER"],
  "/brand": ["SUPER_ADMIN", "STORE_MANAGER"],
  "/clienti": ["SUPER_ADMIN", "STORE_MANAGER"],
  "/fatture": ["SUPER_ADMIN", "STORE_MANAGER"],
  "/contabilita": ["SUPER_ADMIN", "STORE_MANAGER"],
  "/magazzino": ["SUPER_ADMIN", "STORE_MANAGER"],
  "/pagine": ["SUPER_ADMIN"],
  "/dipendenti": ["SUPER_ADMIN"],
  "/audit": ["SUPER_ADMIN"],
};

export function isRouteAllowed(pathname: string, role: string): boolean {
  for (const [route, roles] of Object.entries(ROUTE_ROLES)) {
    if (pathname === route || pathname.startsWith(route + "/")) {
      return roles.includes(role);
    }
  }
  return true; // routes not in the map are accessible to all
}
