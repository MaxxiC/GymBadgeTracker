import { createContext, useReducer, useContext, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const authReducer = (state, action) => {
    switch (action.type) {
        case 'LOGIN':
            return {
                user: action.payload.user,
                token: action.payload.token,
                expiresAt: action.payload.expiresAt
            };
        case 'LOGOUT':
            return { user: null, token: null, expiresAt: null };
        default:
            return state;
    }
}

export const AuthContextProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, {
        user: JSON.parse(localStorage.getItem('user')) || null,
        token: localStorage.getItem('token') || null,
        expiresAt: localStorage.getItem('expiresAt') || null,
    });

    const navigate = useNavigate(); // Hook di navigazione per reindirizzare

    // Funzione di logout memorizzata con useCallback
    const logout = useCallback(() => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('expiresAt');
        dispatch({ type: 'LOGOUT' });
    }, []); // La funzione non dipende da alcun valore esterno

    // Verifica se il token è scaduto
    useEffect(() => {
        const currentTime = new Date().getTime();
        if (state.expiresAt && currentTime >= state.expiresAt) {
            logout();  // Esegui il logout se il token è scaduto
            navigate('/');  // Reindirizza alla homepage (o login)
        }
    }, [state.expiresAt, logout, navigate]);

    // Memorizza il risultato dell'autenticazione
    const isAuthenticated = useMemo(() => {
        const currentTime = new Date().getTime();
        return state.user && state.expiresAt && currentTime < state.expiresAt;
    }, [state.user, state.expiresAt]);

    // Salva i dati dell'autenticazione
    const saveAuthData = (user, token, expiresIn) => {
        const expiresAt = new Date().getTime() + expiresIn * 1000;
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', token);
        localStorage.setItem('expiresAt', expiresAt);
        dispatch({ type: 'LOGIN', payload: { user, token, expiresAt } });
    };

    return (
        <AuthContext.Provider value={{
            user: state.user,
            token: state.token,
            isAuthenticated,  // Ora è un valore memorizzato
            saveAuthData,
            logout,
            dispatch
        }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom Hook per utilizzare il contesto
export const useAuthContext = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw Error('useAuthContext must be used inside an AuthContextProvider');
    }

    return context;
};
