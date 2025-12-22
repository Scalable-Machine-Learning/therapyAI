import React, {useState} from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../css/Signup.css'
import { UserAuth } from '../context/AuthContext'

const Signup = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState('')

    const {session, signUpNewUser} = UserAuth();
    console.log(session);
    const navigate = useNavigate();

    const handleSignUp = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const result = await signUpNewUser(email, password);
            if (!result.success) {
                navigate('/dashboard');
            }
        } catch (err) {
            setError("an error occurred during sign up");
            console.log(err.message);
        } finally {
            setLoading(false);
        }
        if (session === null) {
            setError("You already have an account. Please sign in.");
        }
    }

  return (
    <div>
      <form onSubmit={handleSignUp}>
        <h2>Signup To Start!</h2>
        <p>Already have an account? <Link to="/signin">Sign in!</Link></p>
        <div>
            <input onChange={(e) => setEmail(e.target.value)} placeholder='Email' type="email" name="" id="" />
            <input onChange={(e) => setPassword(e.target.value)} placeholder='Password' type="password" name="" id="" />
            <button type='submit' disabled={loading}>Sign Up</button>
            {error && <p>{error}</p>}
        </div>
      </form>

    </div>
  )
}

export default Signup
