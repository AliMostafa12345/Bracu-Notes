const db = firebase.firestore();
const notesContainer = document.getElementById('notesContainer');
const searchBox = document.getElementById('searchBox');

function renderNote(note) {
  const div = document.createElement('div');
  div.className = 'note-card';
  div.innerHTML = `
    <h3>${note.title}</h3>
    <p>${note.description}</p>
    <p><strong>Course:</strong> ${note.course}</p>
  `;
  notesContainer.appendChild(div);
}

function fetchNotes(searchTerm = '') {
  notesContainer.innerHTML = 'Loading notes...';

  db.collection('resources')
    .orderBy('timestamp', 'desc')
    .get()
    .then(snapshot => {
      notesContainer.innerHTML = '';
      let found = false;

      snapshot.forEach(doc => {
        const data = doc.data();
        const match =
          data.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          data.course.toLowerCase().includes(searchTerm.toLowerCase());

        if (match) {
          renderNote(data);
          found = true;
        }
      });

      if (!found) {
        notesContainer.innerHTML = '<p>No notes found.</p>';
      }
    })
    .catch(error => {
      console.error('Error loading notes:', error);
      notesContainer.innerHTML = '<p>Error loading notes.</p>';
    });
}

searchBox.addEventListener('input', () => {
  fetchNotes(searchBox.value);
});

// Initial fetch on page load
fetchNotes();
