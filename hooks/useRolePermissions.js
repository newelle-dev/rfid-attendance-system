import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

export function useRolePermissions() {
  const { data: session, status } = useSession();
  const [permissions, setPermissions] = useState(null);
  const [isFetching, setIsFetching] = useState(true);

  const userRole = session?.user?.role;
  const loading = (status === 'loading' && !session) || (isFetching && !permissions);

  useEffect(() => {
    let isMounted = true;

    const fetchUserPermissions = async () => {
      if (!userRole) {
        if (isMounted) {
          setIsFetching(false);
        }
        return;
      }

      try {
        const res = await fetch('/api/admin/role-permissions');
        if (res.ok && isMounted) {
          const data = await res.json();
          const userPermissions = (data.permissions || []).filter(
            p => p.role === userRole
          );
          
          // Convert array to object for easier access
          const permissionsObj = {};
          userPermissions.forEach(perm => {
            const parsed = typeof perm.permission === 'string' 
              ? JSON.parse(perm.permission) 
              : (perm.permission || {});
            permissionsObj[perm.module] = parsed;
          });
          
          setPermissions(permissionsObj);
        }
      } catch (error) {
        console.error('Error fetching user permissions:', error);
      } finally {
        if (isMounted) {
          setIsFetching(false);
        }
      }
    };

    if (status !== 'loading') {
      fetchUserPermissions();
    }

    return () => {
      isMounted = false;
    };
  }, [userRole, status]);

  const refetchPermissions = useCallback(async () => {
    if (userRole) {
      try {
        const res = await fetch('/api/admin/role-permissions');
        if (res.ok) {
          const data = await res.json();
          const userPermissions = (data.permissions || []).filter(
            p => p.role === userRole
          );
          
          // Convert array to object for easier access
          const permissionsObj = {};
          userPermissions.forEach(perm => {
            const parsed = typeof perm.permission === 'string' 
              ? JSON.parse(perm.permission) 
              : (perm.permission || {});
            permissionsObj[perm.module] = parsed;
          });
          
          setPermissions(permissionsObj);
        }
      } catch (error) {
        console.error('Error fetching user permissions:', error);
      }
    }
  }, [userRole]);

  const hasPermission = (module, action) => {
    if (!permissions || !permissions[module]) return false;
    return permissions[module][action] === true;
  };

  const hasAnyPermission = (module) => {
    if (!permissions || !permissions[module]) return false;
    return Object.values(permissions[module]).some(Boolean);
  };

  const canAccess = (module) => {
    return hasPermission(module, 'access');
  };

  const canEdit = (module) => {
    return hasPermission(module, 'write');
  };

  const canDelete = (module) => {
    return hasPermission(module, 'delete');
  };

  const canExport = (module) => {
    return hasPermission(module, 'export');
  };

  return {
    permissions,
    loading,
    hasPermission,
    hasAnyPermission,
    canAccess,
    canEdit,
    canDelete,
    canExport,
    refetch: refetchPermissions
  };
}
