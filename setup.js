// js/setup.js

console.log("📝 Setup script loaded");

document.addEventListener('DOMContentLoaded', function() {
    console.log("📄 Page loaded");
    
    const setupForm = document.getElementById('setupForm');
    const messageDiv = document.getElementById('message');
    
    if (!setupForm) {
        console.error("❌ Form not found!");
        return;
    }
    
    if (typeof auth === 'undefined' || !auth) {
        console.error("❌ Firebase not ready!");
        messageDiv.textContent = "Error: Firebase not loaded. Please refresh.";
        messageDiv.className = "message error";
        return;
    }
    
    console.log("✅ Firebase ready");
    
    setupForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const schoolName = document.getElementById('schoolName').value;
        const email = document.getElementById('schoolEmail').value;
        const password = document.getElementById('password').value;
        const schoolType = document.querySelector('input[name="schoolType"]:checked').value;
        
        console.log("📝 Form data:", { schoolName, email, schoolType });
        
        if (password.length < 6) {
            messageDiv.textContent = "Password must be at least 6 characters";
            messageDiv.className = "message error";
            return;
        }
        
        try {
            const submitBtn = document.getElementById('setupBtn');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';
            
            console.log("🔐 Creating user...");
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            console.log("✅ User created:", user.uid);
            
            const classes = schoolType === 'primary' 
                ? ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8']
                : ['Form 1', 'Form 2', 'Form 3', 'Form 4'];
            
            console.log("📚 Classes:", classes);
            
            const schoolData = {
                name: schoolName,
                type: schoolType,
                classes: classes,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                createdBy: user.uid,
                email: email,
                status: 'active'
            };
            
            const schoolRef = await db.collection('schools').add(schoolData);
            console.log("✅ School created:", schoolRef.id);
            
            const userData = {
                email: email,
                role: 'admin',
                schoolId: schoolRef.id,
                name: 'Administrator',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                uid: user.uid
            };
            
            await db.collection('users').doc(user.uid).set(userData);
            console.log("✅ User profile created");
            
            messageDiv.innerHTML = `
                <strong>✅ Success!</strong><br>
                School: ${schoolName}<br>
                Type: ${schoolType}<br>
                Classes: ${classes.length} classes<br>
                Admin: ${email}
            `;
            messageDiv.className = "message success";
            
            submitBtn.innerHTML = '<i class="fas fa-check"></i> Complete!';
            
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 3000);
            
        } catch (error) {
            console.error("❌ Error:", error);
            messageDiv.textContent = error.message;
            messageDiv.className = "message error";
            
            const submitBtn = document.getElementById('setupBtn');
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-rocket"></i> Create School';
        }
    });
});