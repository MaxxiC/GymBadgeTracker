import { createContext, useReducer, useContext, useMemo } from "react";

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

    // Funzione per fare il logout
    const logout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('expiresAt');
        dispatch({ type: 'LOGOUT' });
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
