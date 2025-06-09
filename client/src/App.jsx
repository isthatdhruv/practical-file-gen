import React, { useState } from 'react';
import axios from 'axios';

const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function App() {
  const [form, setForm] = useState({
    name: '',
    roll: '',
    branch: '',
    subject: 'computer_networks',
    professor: '', // New field
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${apiUrl}/generate`, form, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${form.subject}_file.pdf`;
      a.click();
    } catch (err) {
      alert('Failed to generate file');
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow w-100" style={{maxWidth: 400}}>
        <h2 className="mb-4 text-center text-primary">Download Practical File</h2>

        <div className="mb-3">
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
            required
            className="form-control"
          />
        </div>
        <div className="mb-3">
          <input
            type="text"
            name="roll"
            placeholder="Roll Number"
            value={form.roll}
            onChange={handleChange}
            required
            className="form-control"
          />
        </div>
        <div className="mb-3">
          <input
            type="text"
            name="branch"
            placeholder="Branch"
            value={form.branch}
            onChange={handleChange}
            required
            className="form-control"
          />
        </div>
        <div className="mb-3">
          <input
            type="text"
            name="professor"
            placeholder="Submitted To (e.g., Mr. Sharma, Mrs. Verma)"
            value={form.professor}
            onChange={handleChange}
            required
            className="form-control"
          />
        </div>
        <div className="mb-4">
          <select
            name="subject"
            value={form.subject}
            onChange={handleChange}
            className="form-select"
          >
            <option value="computer_networks">Computer Networks</option>
            <option value="compiler_design">Compiler Design</option>
            <option value="software_engineering">Software Engineering</option>
            <option value="big_data">Big Data</option>
          </select>
        </div>
        <button type="submit" className="btn btn-primary w-100">
          Download File
        </button>
      </form>
    </div>
  );
}

export default App;
