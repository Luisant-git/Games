import { useState, useEffect } from "react";
import { createSupportTicket, getSupportTickets } from "../api/support.js";
import "./Support.css";

const Support = () => {
  const [fileName, setFileName] = useState("");
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ subject: "", message: "", image: null });

  const onFileChange = (e) => {
    const f = e.target.files?.[0];
    setFileName(f ? f.name : "");
    setFormData({...formData, image: f});
  };

  const fetchTickets = async () => {
    try {
      const data = await getSupportTickets();
      setTickets(data);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await createSupportTicket(formData);
      setFormData({ subject: "", message: "", image: null });
      setFileName("");
      document.getElementById('image').value = '';
      await fetchTickets();
    } catch (error) {
      console.error('Error creating ticket:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  return (
    <div className="support screen-pad">
      {/* Top title (page title area handled by your app header) */}
      <div className="page-title">SUPPORT CENTER</div>

      {/* Create Ticket Card */}
      <div className="card">
        <div className="card-title">
          <span>Create New Support Ticket</span>
        </div>

        <form className="ticket-form" onSubmit={handleSubmit}>
          <label className="field-label" htmlFor="subject">
            Subject
          </label>
          <input
            id="subject"
            className="input"
            type="text"
            placeholder="Enter subject"
            value={formData.subject}
            onChange={(e) => setFormData({...formData, subject: e.target.value})}
            required
          />

          <label className="field-label" htmlFor="message">
            Message
          </label>
          <textarea
            id="message"
            className="textarea"
            placeholder="Describe your issue"
            rows={6}
            value={formData.message}
            onChange={(e) => setFormData({...formData, message: e.target.value})}
            required
          />

          <div className="upload-row">
            <label htmlFor="image" className="upload-label">
              <span className="upload-icon">🖼️</span>
              <span>Upload Image (Max 2MB)</span>
            </label>
            <input
              id="image"
              type="file"
              accept="image/*"
              className="upload-input"
              onChange={onFileChange}
            />
            <div className="upload-note">
              {fileName ? fileName : "No file selected"}
            </div>
          </div>

          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? 'SUBMITTING...' : 'SUBMIT'}
          </button>
        </form>
      </div>

      {/* Recent Tickets Card */}
      <div className="card">
        <div className="card-title">
          <span>Recent Support Tickets</span>
        </div>
        {tickets.length === 0 ? (
          <div className="empty-state">No support tickets found</div>
        ) : (
          <div className="tickets-list">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="ticket-item">
                <div className="ticket-header">
                  <h4>{ticket.subject}</h4>
                  <span className={`status ${ticket.status.toLowerCase()}`}>
                    {ticket.status}
                  </span>
                </div>
                <p className="ticket-message">{ticket.message}</p>
                {ticket.image && (
                  <img 
                    src={ticket.image} 
                    alt="Ticket attachment" 
                    style={{ maxWidth: '100%', maxHeight: '200px', marginTop: '10px', borderRadius: '6px', cursor: 'pointer' }}
                    onClick={() => window.open(ticket.image, '_blank')}
                  />
                )}
                <div className="ticket-date">
                  {new Date(ticket.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* bottom spacer for tabbar */}
      <div className="safe-area" />
    </div>
  );
};

export default Support;
