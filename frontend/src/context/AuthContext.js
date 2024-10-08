// src/context/AuthContext.js
import { createContext, useReducer, useContext } from "react";

export const AuthContext = createContext();

export const authReducer = (state, action) => {
    switch (action.type) {
        case 'LOGIN':
            return { user: action.payload };
        case 'LOGOUT':
            return { user: null };
        default:
            return state;
    }
}

export const AuthContextProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, {
        user: JSON.parse(localStorage.getItem('user')) || null,
        expiresAt: localStorage.getItem('expiresAt') || null,
    });

    // Controlla se l'utente è autenticato
    const isAuthenticated = () => {
        const currentTime = new Date().getTime();
        return state.user && state.expiresAt && currentTime < state.expiresAt;
    };

    // Salva l'utente e la scadenza
    const saveAuthData = (user) => {
        const expiresAt = new Date().getTime() + 5 * 60 * 1000; // Scadenza 5 minuti
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('expiresAt', expiresAt);
        dispatch({ type: 'LOGIN', payload: user });
    };

    return (
        <AuthContext.Provider value={{ user: state.user, dispatch, isAuthenticated, saveAuthData }}>
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
