import jwt from 'jsonwebtoken'

/**
 * Authentication middleware to verify JWT tokens.
 * Extracts the Bearer token, verifies its integrity, and ensures the payload
 * contains the necessary user identity for RBAC.
 */
export const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' })
    }

    const token = authHeader.split(' ')[1]

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        // Critical: Ensure the token contains the role for RBAC enforcement
        if (!decoded || !decoded.role) {
            return res.status(401).json({ error: 'Invalid token payload: Role missing' })
        }

        req.user = decoded
        next()
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired' })
        }
        // Covers Malformed tokens, Signature failures, etc.
        return res.status(401).json({ error: 'Invalid or malformed token' })
    }
}