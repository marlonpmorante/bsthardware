// src/hooks/useAuth.js
// This file is purely for convenience, making it easier to import `useAuth`
// instead of `useContext(AuthContext)` directly everywhere.
import { useContext } from 'react';
import { AuthContext } from '../components/contexts/AuthContext';

const useAuth = () => {
    return useContext(AuthContext);
};

export default useAuth;