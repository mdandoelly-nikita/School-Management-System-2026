// js/login.js

console.log("🔐 Login script loaded");

document.addEventListener('DOMContentLoaded', function() {
    console.log("📄 Login page loaded");
    
    const loginForm = document.getElementById('loginForm');
    const messageDiv = document.getElementById('message');
    const loginBtn = document.getElementById('loginBtn');
    
    if (!loginForm) {
        console.error("❌ Login form not found!");
        return;
    }
    
    // Check Firebase
    if (typeof auth === 'undefined' || !auth) {
        messageDiv.textContent = "Error: Firebase not loaded. Please refresh.";
        messageDiv.className = "message error";
        return;
    }
    
    console.log("✅ Firebase ready for login");
    
    // Handle login
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        // Simple validation
        if (!email || !password) {
            messageDiv.textContent = "Please enter both email and password";
            messageDiv.className = "message error";
            return;
        }
        
        try {
            // Show loading
            loginBtn.disabled = true;
            loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
            
            console.log("🔐 Attempting login for:", email);
            
            // Sign in with Firebase
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            console.log("✅ Login successful! User ID:", user.uid);
            
            // Get user role from Firestore
            console.log("📚 Fetching user role...");
            const userDoc = await db.collection('users').doc(user.uid).get();
            
            if (userDoc.exists) {
                const userData = userDoc.data();
                console.log("✅ User data:", userData);
                
                // Show success message
                messageDiv.innerHTML = `
                    <strong>✅ Login successful!</strong><br>
                    Welcome ${userData.name || 'Admin'}<br>
                    Role: ${userData.role}<br>
                    School ID: ${userData.schoolId}<br><br>
                    <small>Redirecting to dashboard...</small>
                `;
                messageDiv.className = "message success";
                
                // Redirect based on role (we'll create dashboards later)
                setTimeout(() => {
                    if (userData.role === 'admin') {
                        window.location.href = 'admin-dashboard.html';
                    } else if (userData.role === 'teacher') {
                        window.location.href = 'teacher-dashboard.html';
                    } else {
                        window.location.href = 'dashboard.html';
                    }
                }, 2000);
                
            } else {
                // User exists but no role document (shouldn't happen with our setup)
                console.warn("⚠️ No user document found");
                messageDiv.textContent = "Login successful but no profile found. Please contact support.";
                messageDiv.className = "message warning";
                
                setTimeout(() => {
                    window.location.href = 'setup.html';
                }, 2000);
            }
            
        } catch (error) {
            console.error("❌ Login error:", error);
            
            // Handle specific error messages
            let errorMessage = "Login failed. Please try again.";
            
            switch(error.code) {
                case 'auth/user-not-found':
                    errorMessage = "No account found with this email. Please register first.";
                    break;
                case 'auth/wrong-password':
                    errorMessage = "Incorrect password. Please try again.";
                    break;
                case 'auth/invalid-email':
                    errorMessage = "Invalid email format.";
                    break;
                case 'auth/user-disabled':
                    errorMessage = "This account has been disabled.";
                    break;
                default:
                    errorMessage = error.message;
            }
            
            messageDiv.textContent = errorMessage;
            messageDiv.className = "message error";
            
            // Reset button
            loginBtn.disabled = false;
            loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
        }
    });
    
    // Test credentials helper (for development)
    document.getElementById('testCredentials').addEventListener('click', function(e) {
        e.preventDefault();
        
        // You can change this to one of your test accounts
        document.getElementById('email').value = 'admin@myschool.com';
        document.getElementById('password').value = '123456';
        
        messageDiv.textContent = "Test credentials filled! Click Login";
        messageDiv.className = "message success";
    });
});