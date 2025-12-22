import { createContext, useEffect, useState, useContext } from "react";
import { supabase } from "../supabaseClient";
import { use } from "react";

const AuthContext = createContext();

export const AuthcontextProvider = ({ children }) => {
    const [session, setSession] = useState(undefined);

    //signup
    const signUpNewUser = async (email, password) => {
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
        });

        if (error) {
            console.log("Error signing up:", error);
            return { success: false, error };
        }
        return { success: true, data };
    }

    // signin
    const signInUser = async (email, password) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (error) {
                console.log("Error signing in:", error.message);
                return { success: false, error: error.message };
            }
            console.log("Sign-in successful:", data);
            return { success: true, data };

        } catch (error) {
            console.log("Error signing in:", error.message);
            return { success: false, error: "An unexpected error occurred. Please try again." };
        }
    }

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });

        supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });
    }, []);

    // signout
    const signOut = () => {
        const { error } = supabase.auth.signOut();
        if (error) {
            console.log("Error signing out:", error);
        }
    }


    return (
        <AuthContext.Provider value={{ session, signUpNewUser, signOut, signInUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export const UserAuth = () => useContext(AuthContext);