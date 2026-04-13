/**
 * Role-based access control (RBAC) middleware
 * Ensures the user is authenticated and possesses one of the authorized roles
 */
export const requireRole = (...roles) => (req, res, next) => {
    // Ensures the user is authenticated before checking the role
    if (!req.user || !req.user.role) {
        return res.status(401).json({ error: 'Authentication required' })
    }

    // Validates if the user's role is included in the allowed roles for the route
    if (!roles.includes(req.user.role)) {
        return res.status(403).json({ error: 'Access denied' })
    }

    next()
}

/**
 * Convenience aliases for profile-based access control
 * Aligned with project's simplified permission structure (admin, docente, aluno)
 */
export const isAdmin  = requireRole('admin')
export const isDocente = requireRole('admin', 'docente')
export const isAluno  = requireRole('admin', 'aluno')