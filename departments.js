const auth = firebase.auth();
const db = firebase.firestore();

const authStatus = document.getElementById('authStatus');
const adminSection = document.getElementById('adminSection');
const deptList = document.getElementById('departmentsList');
const deptSelect = document.getElementById('deptSelect');

const adminUIDs = ['qVVVy5UkrCUiyQlzyhbdAU01x6b2']; // your admin UID list

let isAdmin = false;
let currentUser = null;

// Render departments and their courses
function renderDepartments(departments) {
  deptList.innerHTML = '';
  deptSelect.innerHTML = '';

  departments.forEach(dept => {
    const div = document.createElement('div');
    div.className = 'note-card';
    div.innerHTML = `
      <h3>${dept.name}</h3>
      <ul>
        ${(dept.courses || []).map(course => `
          <li>
            ${course} 
            <button onclick="viewResources('${dept.name}', '${course}')">View Resources</button>
          </li>
        `).join('')}
      </ul>
    `;
    deptList.appendChild(div);

    const option = document.createElement('option');
    option.value = dept.name;
    option.textContent = dept.name;
    deptSelect.appendChild(option);
  });
}

// Load departments from Firestore
function loadDepartments() {
  db.collection('departments').get()
    .then(snapshot => {
      const departments = [];
      snapshot.forEach(doc => {
        departments.push({ id: doc.id, ...doc.data() });
      });
      renderDepartments(departments);
    })
    .catch(error => {
      console.error('Error loading departments:', error);
    });
}

// Redirect to resources page with parameters
function viewResources(dept, course) {
  console.log("View Resources called for dept:", dept, "course:", course);
  const url = `resources.html?dept=${encodeURIComponent(dept)}&course=${encodeURIComponent(course)}`;
  window.open(url, '_blank');
}

// Setup form listeners after DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const addDeptForm = document.getElementById('addDeptForm');
  const addCourseForm = document.getElementById('addCourseForm');

  // Add a new department
  addDeptForm.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('deptName').value.trim();
    if (!name) return;

    db.collection('departments').add({
      name: name,
      courses: []
    }).then(() => {
      document.getElementById('deptName').value = '';
      loadDepartments();
    }).catch(error => {
      console.error('Error adding department:', error);
    });
  });

  // Add a new course to selected department
  addCourseForm.addEventListener('submit', e => {
    e.preventDefault();
    const dept = deptSelect.value;
    const course = document.getElementById('courseName').value.trim();
    if (!course || !dept) return;

    db.collection('departments')
      .where('name', '==', dept)
      .get()
      .then(snapshot => {
        if (!snapshot.empty) {
          const doc = snapshot.docs[0];
          const data = doc.data();
          const updatedCourses = data.courses || [];
          if (!updatedCourses.includes(course)) {
            updatedCourses.push(course);
            db.collection('departments').doc(doc.id).update({ courses: updatedCourses }).then(loadDepartments);
          }
        }
      })
      .catch(error => {
        console.error('Error adding course:', error);
      });

    document.getElementById('courseName').value = '';
  });
});

// Monitor auth state and show admin features if admin
auth.onAuthStateChanged(user => {
  currentUser = user;
  if (user && adminUIDs.includes(user.uid)) {
    isAdmin = true;
    authStatus.textContent = `Signed in as Admin: ${user.email}`;
    adminSection.style.display = 'block';
  } else if (user) {
    authStatus.textContent = `Signed in as: ${user.email}`;
    adminSection.style.display = 'none';
  } else {
    authStatus.textContent = 'Not signed in.';
    adminSection.style.display = 'none';
  }
  loadDepartments();
});
