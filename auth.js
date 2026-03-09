// js/auth.js

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const messageDiv = document.getElementById('message');
            const loginBtn = document.getElementById('loginBtn');
            
            try {
                loginBtn.disabled = true;
                loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
                
                const userCredential = await auth.signInWithEmailAndPassword(email, password);
                const user = userCredential.user;
                
                const userDoc = await db.collection('users').doc(user.uid).get();
                
                if (userDoc.exists) {
                    const userData = userDoc.data();
                    
                    messageDiv.textContent = "✅ Login successful! Redirecting...";
                    messageDiv.className = "message success";
                    
                    setTimeout(() => {
                        switch(userData.role) {
                            case 'admin':
                                window.location.href = 'pages/admin/dashboard.html';
                                break;
                            case 'teacher':
                                window.location.href = 'pages/teacher/dashboard.html';
                                break;
                            case 'student':
                                window.location.href = 'pages/student/dashboard.html';
                                break;
                            case 'parent':
                                window.location.href = 'pages/parent/dashboard.html';
                                break;
                            case 'finance':
                                window.location.href = 'pages/finance/dashboard.html';
                                break;
                            default:
                                window.location.href = 'dashboard.html';
                        }
                    }, 1500);
                }
            } catch (error) {
                messageDiv.textContent = error.message;
                messageDiv.className = "message error";
                loginBtn.disabled = false;
                loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
            }
        });
    }
});

window.logout = function() {
    auth.signOut().then(() => window.location.href = 'login.html');
};