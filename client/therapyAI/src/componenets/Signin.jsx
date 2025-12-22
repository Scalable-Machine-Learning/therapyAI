import React, {useState} from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../css/Signup.css'
import { UserAuth } from '../context/AuthContext'

const Signin = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState('')

    const {session, signInUser} = UserAuth();
    console.log(session);
    const navigate = useNavigate();

    const handleSignIn = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const result = await signInUser(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError("an error occurred during sign in");
            console.log(err.message);
        } finally {
            setLoading(false);
        }
    }

  return (
    <div>
      <form onSubmit={handleSignIn}>
        <h2>Welcome Back!</h2>
        <p>Don't have an account? <Link to="/signup">Sign up!</Link></p>
        <div>
            <input onChange={(e) => setEmail(e.target.value)} placeholder='Email' type="email" name="" id="" />
            <input onChange={(e) => setPassword(e.target.value)} placeholder='Password' type="password" name="" id="" />
            <button type='submit' disabled={loading}>Sign In</button>
            {error && <p>{error}</p>}
        </div>
      </form>

    </div>
  )
}

export default Signin
