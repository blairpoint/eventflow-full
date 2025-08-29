/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import {useState, useMemo, useRef, useEffect} from 'react';
import ReactDOM from 'react-dom/client';

// --- MOCK DATA ---
const mockData = {
  users: [
    { id: 'user1', firstName: 'Blair', lastName: 'Robson', email: 'blair@test.com', password: 'password123', avatar: 'https://i.imgur.com/Q9q2b6T.png' }
  ],
  organisations: [
    { id: 'org1', name: 'FOR TUNES', logo: 'https://i.imgur.com/eQ9g54m.png' },
    { id: 'org2', name: 'Gold for Gold Limited' },
  ],
  initialEvents: [
    { id: 'ev1', organisationId: 'org1', name: 'Summer Music Festival' },
    { id: 'ev2', organisationId: 'org1', name: 'Electronic Nights' },
    { id: 'ev3', organisationId: 'org2', name: 'Jazz Fusion Fest' },
  ],
  inventory: {
    equipment: [
      { id: 'eq1', organisationId: 'org1', name: 'Pioneer CDJ-3000', type: 'DJ Deck' },
      { id: 'eq2', organisationId: 'org1', name: 'Allen & Heath Xone:96', type: 'Mixer' },
      { id: 'eq3', organisationId: 'org2', name: 'Shure SM58 Microphone', type: 'Microphone' },
    ],
    artists: [
      { id: 'art1', organisationId: 'org1', name: 'DJ Sarah Mix', genre: 'House', rate: 500, bio: 'High-energy house DJ known for vibrant sets.' },
      { id: 'art2', organisationId: 'org1', name: 'The Live Wires', genre: 'Indie Rock', rate: 1200, bio: 'Four-piece band with a catchy, upbeat sound.' },
      { id: 'art3', organisationId: 'org2', name: 'Smooth Jazz Trio', genre: 'Jazz', rate: 800, bio: 'Elegant jazz trio perfect for sophisticated events.' },
    ],
  },
  tickets: {
    'ev1': [
      { id: 't1', order: 1, name: 'EARLY BIRD', price: 19.00, quantity: 30, sold: 1, status: 'Published', imageUrl: 'https://i.imgur.com/gC5sSUD.png' },
      { id: 't2', order: 2, name: '(GA) General Admission', price: 24.99, quantity: 100, sold: 0, status: 'Published', imageUrl: 'https://i.imgur.com/gC5sSUD.png' },
      { id: 't3', order: 3, name: 'Final Release', price: 31.99, quantity: 40, sold: 0, status: 'Draft', imageUrl: 'https://i.imgur.com/gC5sSUD.png' },
      { id: 't4', order: 4, name: 'CREW', price: 0, quantity: 20, sold: 0, status: 'Draft', imageUrl: 'https://i.imgur.com/O6p3f0w.png' },
    ]
  },
  kanban: {
    'ev1': {
      columns: [
        {
          id: 'col1',
          title: 'To Do',
          cards: [
            { id: 'card1', content: 'Book main headline artist' },
            { id: 'card2', content: 'Finalize venue contract' },
            { id: 'card3', content: 'Design event poster' },
          ]
        },
        {
          id: 'col2',
          title: 'In Progress',
          cards: [
            { id: 'card4', content: 'Set up ticketing page' },
            { id: 'card5', content: 'Contact sound & lighting vendors' },
          ]
        },
        {
          id: 'col3',
          title: 'Done',
          cards: [
            { id: 'card6', content: 'Secure initial seed funding' }
          ]
        }
      ]
    }
  },
  budgets: {
    'ev1': {
      sections: [
        {
          id: 'sec1',
          name: 'Event',
          items: [
            { id: 'item1', title: 'Venue Hire', amount: 5000, type: 'Expense' },
            { id: 'item2', title: 'Sound System Rental', amount: 1500, type: 'Expense' },
            { id: 'item3', title: 'Artist Fees', amount: 10000, type: 'Expense' },
          ]
        },
        {
          id: 'sec2',
          name: 'Marketing',
          items: [
             { id: 'item4', title: 'Social Media Ads', amount: 800, type: 'Expense' },
             { id: 'item5', title: 'Poster Printing', amount: 300, type: 'Expense' },
          ]
        }
      ]
    }
  },
  payments: {
    'ev1': {
      stats: [
        { label: 'Tickets Sold', value: 1, icon: 'fas fa-ticket-alt' },
        { label: 'Net Revenue', value: 'NZ$0', icon: 'fas fa-dollar-sign' },
        { label: 'Referral Rebates', value: 'NZ$0', icon: 'fas fa-users' },
        { label: 'Tickets in Carts', value: 0, icon: 'fas fa-shopping-cart' },
        { label: 'Tickets Locked', value: 0, icon: 'fas fa-lock' },
        { label: 'Buyers', value: 0, icon: 'fas fa-user-friends' },
      ],
      ticketSales: {
        // One ticket sold (index 7), the rest are placeholders for a nice graph
        quantity: [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
        revenue: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      },
      stripe: {
        today: { net: 'NZ$3,528,198.72', yesterday: 'NZ$2,931,556.34' },
        salesVolume: { net: 'NZ$39,274.29', prev: 'NZ$29,573.54', change: '+32.8%' },
        newCustomers: { count: 37, prev: 28, change: '+32.1%' }
      }
    }
  }
};

// --- FORM COMPONENTS ---

function AddArtistForm({ onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    genre: '',
    rate: '',
    bio: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.genre || !formData.rate) {
      alert('Please fill out all required fields.');
      return;
    }
    onSave({
      ...formData,
      rate: Number(formData.rate)
    });
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>Add New Artist</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Artist Name</label>
            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="genre">Genre</label>
            <input type="text" id="genre" name="genre" value={formData.genre} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="rate">Standard Rate ($)</label>
            <input type="number" id="rate" name="rate" value={formData.rate} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="bio">Bio</label>
            <textarea id="bio" name="bio" rows={4} value={formData.bio} onChange={handleChange}></textarea>
          </div>
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
            <button type="submit" className="btn-primary">Save Artist</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddEquipmentForm({ onSave, onCancel }) {
  const [formData, setFormData] = useState({ name: '', type: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.type) {
      alert('Please fill out all fields.');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>Add New Equipment</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Equipment Name</label>
            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="type">Type</label>
            <input type="text" id="type" name="type" value={formData.type} onChange={handleChange} required />
          </div>
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
            <button type="submit" className="btn-primary">Save Equipment</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddToEventModal({ item, itemType, events, onSave, onCancel }) {
    const [selectedEventId, setSelectedEventId] = useState(events[0]?.id || '');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedEventId) {
            alert('Please select an event.');
            return;
        }
        onSave(selectedEventId, item, itemType);
    };

    return (
        <div className="modal-backdrop">
            <div className="modal">
                <h2>Add "{item.name}" to an Event</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="event-select">Select Event</label>
                        <div className="select-wrapper dark-select">
                            <select id="event-select" value={selectedEventId} onChange={(e) => setSelectedEventId(e.target.value)}>
                                {events.map(event => (
                                    <option key={event.id} value={event.id}>{event.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="form-actions">
                        <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
                        <button type="submit" className="btn-primary">Add to Event</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function AddTicketForm({ onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    quantity: '',
    status: 'Draft',
    imageUrl: 'https://i.imgur.com/gC5sSUD.png'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.quantity) {
      alert('Please fill out all required fields.');
      return;
    }
    onSave({
      ...formData,
      price: Number(formData.price),
      quantity: Number(formData.quantity)
    });
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>Add New Ticket</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Ticket Name</label>
            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="price">Price ($)</label>
            <input type="number" id="price" name="price" value={formData.price} onChange={handleChange} required min="0" />
          </div>
          <div className="form-group">
            <label htmlFor="quantity">Quantity</label>
            <input type="number" id="quantity" name="quantity" value={formData.quantity} onChange={handleChange} required min="1" />
          </div>
          <div className="form-group">
            <label htmlFor="status">Status</label>
            <div className="select-wrapper dark-select">
                <select id="status" name="status" value={formData.status} onChange={handleChange}>
                    <option value="Draft">Draft</option>
                    <option value="Published">Published</option>
                </select>
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
            <button type="submit" className="btn-primary">Save Ticket</button>
          </div>
        </form>
      </div>
    </div>
  );
}


// --- PAGE COMPONENTS ---

function Dashboard() {
  return (
    <>
      <h2>Dashboard Overview</h2>
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-icon"><i className="fas fa-calendar"></i></div>
          <div className="card-title">Active Events</div>
          <div className="card-value">12</div>
          <div>This month</div>
        </div>
        <div className="dashboard-card">
          <div className="card-icon"><i className="fas fa-ticket-alt"></i></div>
          <div className="card-title">Tickets Sold</div>
          <div className="card-value">1,847</div>
          <div>Total revenue: $92,350</div>
        </div>
        <div className="dashboard-card">
          <div className="card-icon"><i className="fas fa-users"></i></div>
          <div className="card-title">Artists Managed</div>
          <div className="card-value">28</div>
          <div>Active contracts</div>
        </div>
        <div className="dashboard-card">
          <div className="card-icon"><i className="fas fa-music"></i></div>
          <div className="card-title">Equipment Items</div>
          <div className="card-value">156</div>
          <div>Available for hire</div>
        </div>
      </div>
      <h3>Recent Activity</h3>
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Activity</th>
              <th>Event/Item</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>2 minutes ago</td>
              <td>Ticket purchased</td>
              <td>Summer Music Festival</td>
              <td><span className="status-confirmed">Confirmed</span></td>
            </tr>
            <tr>
              <td>15 minutes ago</td>
              <td>Equipment rented</td>
              <td>Pioneer CDJ-3000</td>
              <td><span className="status-rented">Rented</span></td>
            </tr>
            <tr>
              <td>1 hour ago</td>
              <td>Contract signed</td>
              <td>DJ Sarah - Club Night</td>
              <td><span className="status-active">Active</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}

function ArtistsPage({ artists, onAddArtist, onAddToEvent }) {
  const [showAddForm, setShowAddForm] = useState(false);

  const handleSaveArtist = (newArtistData) => {
    onAddArtist(newArtistData);
    setShowAddForm(false);
  };

  return (
    <>
      {showAddForm && <AddArtistForm onSave={handleSaveArtist} onCancel={() => setShowAddForm(false)} />}
      <div className="page-header">
        <h2>Artists</h2>
        <button className="btn-primary" onClick={() => setShowAddForm(true)}>
          <i className="fas fa-plus"></i> Add Artist
        </button>
      </div>
      {artists.length > 0 ? (
        <div className="card-list">
          {artists.map(artist => (
            <div key={artist.id} className="card">
              <button className="btn-add-to-event" onClick={() => onAddToEvent(artist, 'artist')} aria-label={`Add ${artist.name} to an event`}>
                <i className="fas fa-plus"></i>
              </button>
              <h3>{artist.name}</h3>
              <p><strong>Genre:</strong> {artist.genre}</p>
              <p><strong>Rate:</strong> ${artist.rate}</p>
            </div>
          ))}
        </div>
      ) : (
        <p>No artists found for this organisation. Add one to get started!</p>
      )}
    </>
  );
}

function EquipmentPage({ equipment, onAddEquipment, onAddToEvent }) {
  const [showAddForm, setShowAddForm] = useState(false);

  const handleSaveEquipment = (newEquipmentData) => {
    onAddEquipment(newEquipmentData);
    setShowAddForm(false);
  };

  return (
    <>
      {showAddForm && <AddEquipmentForm onSave={handleSaveEquipment} onCancel={() => setShowAddForm(false)} />}
      <div className="page-header">
        <h2>Equipment</h2>
        <button className="btn-primary" onClick={() => setShowAddForm(true)}>
          <i className="fas fa-plus"></i> Add Equipment
        </button>
      </div>
      {equipment.length > 0 ? (
        <div className="card-list">
          {equipment.map(item => (
            <div key={item.id} className="card">
              <button className="btn-add-to-event" onClick={() => onAddToEvent(item, 'equipment')} aria-label={`Add ${item.name} to an event`}>
                 <i className="fas fa-plus"></i>
              </button>
              <h3>{item.name}</h3>
              <p><strong>Type:</strong> {item.type}</p>
            </div>
          ))}
        </div>
      ) : (
        <p>No equipment found for this organisation. Add some to get started!</p>
      )}
    </>
  );
}

function EventoryPage({ eventInventory, allArtists, allEquipment }) {
    return (
        <div className="eventory-page">
            <h2>Eventory</h2>
            <div className="eventory-section">
                <h3><i className="fas fa-microphone-alt"></i> Artists Requested</h3>
                {eventInventory.artists.length > 0 ? (
                    <div className="card-list">
                        {eventInventory.artists.map(contract => {
                            const artist = allArtists.find(a => a.id === contract.id);
                            if (!artist) return null;
                            return (
                                <div key={artist.id} className="card">
                                    <h3>{artist.name}</h3>
                                    <p><strong>Genre:</strong> {artist.genre}</p>
                                    <p><strong>Rate:</strong> ${artist.rate}</p>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p>No artists have been added to this event yet.</p>
                )}
            </div>
            <div className="eventory-section">
                <h3><i className="fas fa-cogs"></i> Equipment Requested</h3>
                {eventInventory.equipment.length > 0 ? (
                     <div className="card-list">
                        {eventInventory.equipment.map(equipmentId => {
                            const item = allEquipment.find(e => e.id === equipmentId);
                            if (!item) return null;
                            return (
                                <div key={item.id} className="card">
                                    <h3>{item.name}</h3>
                                    <p><strong>Type:</strong> {item.type}</p>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p>No equipment has been added to this event yet.</p>
                )}
            </div>
        </div>
    );
}

function DJContractsPage({ event, contractedArtists, allArtists, onUpdateStatus }) {
  const contractStatuses = ['Pending', 'Contract Sent', 'Signed', 'Paid'];

  return (
    <div className="contracts-page">
      <h2>DJ Contracts for {event.name}</h2>
      {contractedArtists.length > 0 ? (
        <div className="card-list">
          {contractedArtists.map(contract => {
            const artist = allArtists.find(a => a.id === contract.id);
            if (!artist) return null;
            
            return (
              <div key={artist.id} className="card contract-card">
                <h3>{artist.name}</h3>
                <p><strong>Genre:</strong> {artist.genre}</p>
                <p><strong>Rate:</strong> ${artist.rate}</p>
                <div className="contract-status-section">
                  <label htmlFor={`status-${artist.id}`}>Contract Status</label>
                   <div className="status-display">
                      <span className={`status-indicator ${contract.status.toLowerCase().replace(' ', '-')}`}></span>
                      <div className="select-wrapper dark-select contract-select">
                        <select
                          id={`status-${artist.id}`}
                          value={contract.status}
                          onChange={(e) => onUpdateStatus(event.id, artist.id, e.target.value)}
                        >
                          {contractStatuses.map(status => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      </div>
                   </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="placeholder-container">
            <h3>No Artists Contracted</h3>
            <p>Go to Inventory {'>'} Artists to add an artist to this event.</p>
        </div>
      )}
    </div>
  );
}

function TicketsPage({ event, eventTickets, onAddTicket, onDeleteTicket }) {
    const [showAddForm, setShowAddForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredTickets = useMemo(() => {
        return eventTickets.filter(ticket =>
            ticket.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [eventTickets, searchTerm]);

    const handleSaveTicket = (newTicketData) => {
        onAddTicket(event.id, newTicketData);
        setShowAddForm(false);
    };

    return (
        <div className="tickets-page">
            {showAddForm && <AddTicketForm onSave={handleSaveTicket} onCancel={() => setShowAddForm(false)} />}
            <div className="tickets-header">
                <div className="tickets-title">
                    <h2>Create Tickets</h2>
                    <p>Set up your ticket types here, such as Earlybirds, General Admission, VIP, etc. There's no limit to the number of ticket types you can create.</p>
                </div>
                <div className="tickets-actions">
                    <div className="search-wrapper">
                        <i className="fas fa-search"></i>
                        <input
                            type="text"
                            placeholder="Search tickets"
                            className="search-input"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="btn-add-ticket" onClick={() => setShowAddForm(true)}>Add ticket</button>
                </div>
            </div>

            <div className="tickets-list-container">
                <div className="tickets-list-header">
                    <div className="header-item order">Order</div>
                    <div className="header-item ticket">Ticket</div>
                    <div className="header-item quantity">Quantity</div>
                    <div className="header-item sold">Sold</div>
                    <div className="header-item status">Status</div>
                    <div className="header-item options">Options</div>
                </div>
                <div className="tickets-list">
                    {filteredTickets.map(ticket => (
                        <div key={ticket.id} className="ticket-row">
                            <div className="ticket-cell order">
                                <i className="fas fa-grip-vertical drag-handle"></i>
                                <span>#{ticket.order}</span>
                            </div>
                            <div className="ticket-cell ticket-info">
                                <img src={ticket.imageUrl} alt="ticket art" className="ticket-image" />
                                <div className="ticket-name-price">
                                    <span className="ticket-name">{ticket.name}</span>
                                    <span className="ticket-price">{ticket.price > 0 ? `Paid $${ticket.price.toFixed(2)}` : 'Free'}</span>
                                </div>
                            </div>
                            <div className="ticket-cell quantity">{ticket.quantity}</div>
                            <div className="ticket-cell sold">
                                <i className="fas fa-grip-vertical drag-handle-sold"></i>
                                <span># {ticket.sold}</span>
                            </div>
                            <div className="ticket-cell status">
                                <span className={`status-badge-ticket ${ticket.status.toLowerCase()}`}>{ticket.status.toUpperCase()}</span>
                            </div>
                            <div className="ticket-cell options">
                                {ticket.status === 'Published' && <button className="ticket-action-btn" aria-label="Gift ticket"><i className="fas fa-gift"></i></button>}
                                <button className="ticket-action-btn" onClick={() => onDeleteTicket(event.id, ticket.id)} aria-label="Delete ticket"><i className="fas fa-trash-alt"></i></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function AddCardForm({ columnId, onSave, onCancel }) {
    const [content, setContent] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (content.trim()) {
            onSave(columnId, content.trim());
            setContent('');
        }
    };

    return (
        <form className="add-card-form" onSubmit={handleSubmit}>
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter a title for this card..."
                rows={3}
                autoFocus
            />
            <div className="add-card-actions">
                <button type="submit" className="btn-primary">Add card</button>
                <button type="button" className="btn-cancel" onClick={onCancel}>
                    <i className="fas fa-times"></i>
                </button>
            </div>
        </form>
    );
}

function KanbanPage({ board, onCardMove, onCardAdd }) {
    const [draggedItem, setDraggedItem] = useState(null); // { card, sourceColumnId }
    const [addingToColumn, setAddingToColumn] = useState(null); // columnId

    const handleDragStart = (e, card, sourceColumnId) => {
        setDraggedItem({ card, sourceColumnId });
        e.dataTransfer.effectAllowed = 'move';
        setTimeout(() => {
            e.target.classList.add('dragging');
        }, 0);
    };
    
    const handleDragEnd = (e) => {
        // Check if the target is still in the DOM before removing the class
        if (e.target) {
            e.target.classList.remove('dragging');
        }
        setDraggedItem(null);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e, destColumnId) => {
        e.preventDefault();
        if (!draggedItem) return;

        const { card, sourceColumnId } = draggedItem;

        if (sourceColumnId !== destColumnId) {
            onCardMove(sourceColumnId, destColumnId, card.id);
        }
        
        setDraggedItem(null);
    };

    const handleSaveCard = (columnId, content) => {
        onCardAdd(columnId, content);
        setAddingToColumn(null);
    };

    return (
        <div className="kanban-page">
            <div className="kanban-header">
                <h2>Project Board</h2>
            </div>
            <div className="kanban-board">
                {board.columns.map(column => (
                    <div
                        key={column.id}
                        className="kanban-column"
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, column.id)}
                    >
                        <div className="kanban-column-header">
                            <h3>{column.title}</h3>
                            <span className="card-count">{column.cards.length}</span>
                        </div>
                        <div className="kanban-cards">
                            {column.cards.map(card => (
                                <div
                                    key={card.id}
                                    className="kanban-card"
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, card, column.id)}
                                    onDragEnd={handleDragEnd}
                                >
                                    {card.content}
                                </div>
                            ))}
                        </div>
                        <div className="kanban-column-footer">
                            {addingToColumn === column.id ? (
                                <AddCardForm 
                                    columnId={column.id}
                                    onSave={handleSaveCard} 
                                    onCancel={() => setAddingToColumn(null)} 
                                />
                            ) : (
                                <button className="add-card-btn" onClick={() => setAddingToColumn(column.id)}>
                                    <i className="fas fa-plus"></i> Add a card
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function BudgetPage({ budget }) {
  const [expandedSections, setExpandedSections] = useState(() => {
    const initialState = {};
    budget.sections.forEach(section => {
      initialState[section.id] = true; // Expand all by default
    });
    return initialState;
  });

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const calculateSectionTotal = (items) => {
    // Assuming all are expenses for now, as per the screenshot
    return items.reduce((sum, item) => sum + item.amount, 0);
  };
  
  const formatCurrency = (amount) => {
    return `NZ$ ${amount.toLocaleString('en-NZ')}`;
  };

  const totalBudget = budget.sections.reduce((total, section) => {
    return total + calculateSectionTotal(section.items);
  }, 0);

  return (
    <div className="budget-page">
      <div className="budget-header">
        <h2>Budget Management</h2>
        <button className="btn-new-section"><i className="fas fa-plus"></i> New Section</button>
      </div>
      <div className="budget-table">
        <div className="budget-table-header">
          <div className="budget-cell title">Title</div>
          <div className="budget-cell amount">Amount</div>
          <div className="budget-cell expense-revenue">Expense/Revenue</div>
          <div className="budget-cell type">Type</div>
          <div className="budget-cell assigned-to">Assigned To</div>
          <div className="budget-cell actions"></div>
        </div>
        <div className="budget-table-body">
          {budget.sections.map(section => (
            <div key={section.id} className="budget-section">
              <div className="budget-section-row">
                <div className="budget-cell title">
                  <button onClick={() => toggleSection(section.id)} className="expand-btn" aria-expanded={expandedSections[section.id]}>
                    <i className={`fas fa-chevron-right ${expandedSections[section.id] ? 'expanded' : ''}`}></i>
                  </button>
                  <span>{section.name}</span>
                </div>
                <div className="budget-cell amount"></div>
                <div className="budget-cell expense-revenue"></div>
                <div className="budget-cell type"></div>
                <div className="budget-cell assigned-to"></div>
                <div className="budget-cell actions">
                  <button className="action-btn" aria-label={`Copy section ${section.name}`}><i className="far fa-clone"></i></button>
                  <button className="action-btn" aria-label={`Delete section ${section.name}`}><i className="fas fa-trash-alt"></i></button>
                </div>
              </div>
              {expandedSections[section.id] && (
                 <div className="budget-item-row total-row">
                    <div className="budget-cell title indented">
                       <span className="indent-line"></span>
                       Total
                    </div>
                    <div className="budget-cell amount">{formatCurrency(calculateSectionTotal(section.items))}</div>
                    <div className="budget-cell expense-revenue">Expenses</div>
                    <div className="budget-cell type"></div>
                    <div className="budget-cell assigned-to"></div>
                    <div className="budget-cell actions"></div>
                 </div>
              )}
            </div>
          ))}
        </div>
        <div className="budget-table-footer">
            <div className="budget-total-row">
                <div className="budget-cell title">Total Budget</div>
                <div className="budget-cell amount">{formatCurrency(totalBudget)}</div>
                <div className="budget-cell expense-revenue">Expenses</div>
                <div className="budget-cell type"></div>
                <div className="budget-cell assigned-to"></div>
                <div className="budget-cell actions"></div>
            </div>
        </div>
      </div>
    </div>
  );
}

function PaymentsPage({ event, data }) {
    const [chartView, setChartView] = useState('quantity');
    const chartData = data.ticketSales[chartView] || [];
    const maxChartValue = chartData.length > 0 ? Math.max(1, ...chartData) : 1; // Avoid division by zero, ensure at least 1 for max height

    return (
        <div className="payments-page">
            <div className="stats-grid">
                {data.stats.map(stat => (
                    <div key={stat.label} className="stat-card">
                        <div className="stat-icon"><i className={`fas ${stat.icon}`}></i></div>
                        <div className="stat-value">{stat.value}</div>
                        <div className="stat-label">{stat.label}</div>
                    </div>
                ))}
            </div>

            <div className="chart-container">
                <div className="chart-header">
                    <h3><i className="fas fa-chart-bar"></i> Ticket Sales</h3>
                    <div className="chart-toggle">
                        <button
                            className={chartView === 'quantity' ? 'active' : ''}
                            onClick={() => setChartView('quantity')}
                        >
                            <i className="fas fa-ticket-alt"></i> Quantity
                        </button>
                        <button
                            className={chartView === 'revenue' ? 'active' : ''}
                            onClick={() => setChartView('revenue')}
                        >
                            <i className="fas fa-dollar-sign"></i> Revenue
                        </button>
                    </div>
                </div>
                <div className="bar-chart-body">
                    <div className="y-axis">
                        {[1.0, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0].map(val => (
                            <div key={val} className="y-axis-label">{val.toFixed(1)}</div>
                        ))}
                    </div>
                    <div className="chart-bars">
                        {chartData.map((value, index) => (
                            <div key={index} className="bar-wrapper">
                                <div
                                    className="bar"
                                    style={{ height: `${(value / maxChartValue) * 100}%` }}
                                    title={`${chartView === 'quantity' ? '' : 'NZ$'}${value}`}
                                ></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="analytics-grid">
                <div className="analytics-card">
                    <div className="analytics-card-header">
                        <h4>Today</h4>
                        <span className="time-label">Now, 14:00</span>
                    </div>
                    <div className="analytics-card-body">
                        <div>
                            <p className="analytics-label">Net volume</p>
                            <p className="analytics-value">{data.stripe.today.net}</p>
                        </div>
                        <div>
                            <p className="analytics-label">Yesterday</p>
                            <p className="analytics-value faded">{data.stripe.today.yesterday}</p>
                        </div>
                    </div>
                    <div className="analytics-card-chart">
                         <svg className="line-chart-svg" viewBox="0 0 100 30" preserveAspectRatio="none">
                            <path d="M 0 25 L 10 25 L 20 25 L 30 20 L 40 20 L 50 15 L 60 15 L 70 12 L 80 12 L 90 12 L 100 12" fill="none" stroke="#e0e0e0" strokeWidth="0.5" />
                            <path d="M 0 25 L 10 25 L 20 25 L 30 20 L 40 20 L 50 15 L 60 15 L 70 12 L 80 12" fill="none" stroke="#8A2BE2" strokeWidth="0.7" />
                        </svg>
                    </div>
                </div>

                <div className="analytics-card">
                    <div className="analytics-card-header">
                        <h4>Net volume from sales</h4>
                        <span className="change-indicator positive">{data.stripe.salesVolume.change}</span>
                    </div>
                    <div className="analytics-card-body">
                        <div>
                            <p className="analytics-value">{data.stripe.salesVolume.net}</p>
                            <p className="analytics-value faded">{data.stripe.salesVolume.prev}</p>
                        </div>
                    </div>
                     <div className="analytics-card-chart">
                         <svg className="line-chart-svg" viewBox="0 0 100 30" preserveAspectRatio="none">
                            <path d="M 0 20 L 20 25 L 40 15 L 60 20 L 80 10 L 100 12" fill="none" stroke="#e0e0e0" strokeWidth="0.5" />
                            <path d="M 0 20 L 20 25 L 40 15 L 60 20 L 80 10 L 100 12" fill="none" stroke="#8A2BE2" strokeWidth="0.7" />
                        </svg>
                    </div>
                </div>

                <div className="analytics-card">
                    <div className="analytics-card-header">
                        <h4>New customers</h4>
                        <span className="change-indicator positive">{data.stripe.newCustomers.change}</span>
                    </div>
                     <div className="analytics-card-body">
                        <div>
                            <p className="analytics-value">{data.stripe.newCustomers.count}</p>
                            <p className="analytics-value faded">{data.stripe.newCustomers.prev}</p>
                        </div>
                    </div>
                     <div className="analytics-card-chart">
                         <svg className="line-chart-svg" viewBox="0 0 100 30" preserveAspectRatio="none">
                            <path d="M 0 25 L 20 20 L 40 18 L 60 10 L 80 12 L 100 8" fill="none" stroke="#e0e0e0" strokeWidth="0.5" />
                            <path d="M 0 25 L 20 20 L 40 18 L 60 10 L 80 12 L 100 8" fill="none" stroke="#8A2BE2" strokeWidth="0.7" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
}


function CreateOrganisationPage({ onCreate, onBack }) {
  const [orgName, setOrgName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!orgName.trim()) {
      alert("Please enter an organisation name.");
      return;
    }
    onCreate({ name: orgName });
  };

  return (
    <div className="create-event-page">
      <header className="page-title-header">
        <button onClick={onBack} className="back-btn-header" aria-label="Go back">
          <i className="fas fa-arrow-left"></i>
          <h1>Create Organisation</h1>
        </button>
      </header>
      <div className="create-event-form-container">
        <form onSubmit={handleSubmit}>
          <div className="settings-form-group">
            <label htmlFor="org-name-create">Organisation Name</label>
            <input 
              type="text" 
              id="org-name-create" 
              value={orgName} 
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="Your cool organisation"
            />
          </div>
          <button type="submit" className="btn-create-event">Create Organisation</button>
        </form>
      </div>
    </div>
  );
}

function CreateEventPage({ organisations, onCreate, onBack }) {
  const [eventName, setEventName] = useState('');
  const [organizer, setOrganizer] = useState(organisations[0]?.id || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!eventName.trim()) {
      alert("Please enter an event name.");
      return;
    }
    onCreate({ name: eventName, organisationId: organizer });
  };

  return (
    <div className="create-event-page">
      <header className="page-title-header">
        <button onClick={onBack} className="back-btn-header" aria-label="Go back">
          <i className="fas fa-arrow-left"></i>
          <h1>Create Event</h1>
        </button>
      </header>
      <div className="create-event-form-container">
        <form onSubmit={handleSubmit}>
          <div className="settings-form-group">
            <label htmlFor="event-name">Event Name</label>
            <input 
              type="text" 
              id="event-name" 
              value={eventName} 
              onChange={(e) => setEventName(e.target.value)} 
            />
          </div>
          <div className="settings-form-group">
            <label htmlFor="event-organizer">Event Organizer</label>
            <div className="select-wrapper">
              <select 
                id="event-organizer" 
                value={organizer} 
                onChange={(e) => setOrganizer(e.target.value)}
                className="settings-select"
              >
                {organisations.map(org => (
                  <option key={org.id} value={org.id}>{org.name}</option>
                ))}
              </select>
            </div>
          </div>
          <button type="submit" className="btn-create-event">Create Event</button>
        </form>
      </div>
    </div>
  );
}

function EventSetupPage({ event, onBack, organisations }) {
  const setupSteps = [
    { id: 'basic-info', name: 'Basic Info', status: 'complete' },
    { id: 'location', name: 'Location', status: 'incomplete' },
    { id: 'date', name: 'Date', status: 'incomplete' },
    { id: 'description', name: 'Description', status: 'incomplete' },
    { id: 'art', name: 'Art', status: 'incomplete' },
    { id: 'tickets', name: 'Tickets', status: 'none' },
    { id: 'refund', name: 'Refund', status: 'none' },
    { id: 'sale', name: 'Sale', status: 'none' },
  ];

  const missingInfo = [
    'Event start date is required',
    'State is required',
    'City is required',
    'Country is required',
    'Postal code is required',
    'Address one is required',
    'Event banner is required'
  ];

  const organizer = organisations.find(o => o.id === event.organisationId);

  return (
    <div className="event-setup-page">
      <header className="page-title-header">
        <button onClick={onBack} className="back-btn-header" aria-label="Go back to events list">
          <i className="fas fa-arrow-left"></i>
          <h2>{event.name}</h2>
        </button>
      </header>
      <div className="event-setup-container">
        <aside className="setup-nav">
          <ul>
            {setupSteps.map(step => (
              <li key={step.id} className={`setup-nav-item ${step.id === 'basic-info' ? 'active' : ''}`}>
                <span>{step.name}</span>
                {step.status === 'complete' && <i className="fas fa-check-circle status-icon complete"></i>}
                {step.status === 'incomplete' && <i className="fas fa-exclamation-circle status-icon incomplete"></i>}
              </li>
            ))}
          </ul>
        </aside>
        <main className="setup-content">
          <div className="settings-card">
            <div className="settings-section-header">
                <h2>Event Details</h2>
                <p>List your basic event details below.</p>
            </div>
            <div className="settings-form-group">
                <label htmlFor="setup-event-name">Event Name</label>
                <input type="text" id="setup-event-name" defaultValue={event.name} />
            </div>
            <div className="settings-form-group">
                <label htmlFor="setup-event-organizer">Event Organizer</label>
                <div className="select-wrapper">
                    <select id="setup-event-organizer" className="settings-select" defaultValue={organizer?.id}>
                        {organisations.map(org => <option key={org.id} value={org.id}>{org.name}</option>)}
                    </select>
                </div>
            </div>
            <div className="settings-form-group">
                <label htmlFor="setup-event-type">Event Type</label>
                <div className="select-wrapper">
                    <select id="setup-event-type" className="settings-select" defaultValue="Public">
                        <option>Public</option>
                        <option>Private</option>
                    </select>
                </div>
            </div>
            <div className="settings-form-group">
                <label htmlFor="setup-age-restriction">Age Restriction</label>
                <input type="number" id="setup-age-restriction" defaultValue="0" />
            </div>
          </div>
          <button className="btn-next-step">Next step</button>
        </main>
        <aside className="setup-sidebar">
          <div className="setup-card">
            <div className="setup-card-header">
              <h3>Event status</h3>
              <span className="draft-badge">DRAFT</span>
            </div>
            <button className="btn-publish-event">Publish event</button>
          </div>
          <div className="setup-card missing-info-card">
            <div className="setup-card-header missing-info-header">
              <h3><i className="fas fa-exclamation-triangle"></i> Missing information</h3>
              <i className="fas fa-chevron-up"></i>
            </div>
            <ul>
              {missingInfo.map((info, index) => (
                <li key={index}>{info}</li>
              ))}
            </ul>
          </div>
          <button className="btn-export-event">Export event data</button>
        </aside>
      </div>
    </div>
  );
}

function MarketingPage() {
    return (
        <div className="marketing-page">
            <div className="image-viewer">
                <img src="https://i.imgur.com/xT3x0aT.png" alt="Generated marketing material" className="main-image" />
                <div className="top-controls">
                    <div className="dropdown-original">
                        Original <i className="fas fa-chevron-down"></i>
                    </div>
                    <button className="close-btn" aria-label="Close viewer"><i className="fas fa-times"></i></button>
                </div>
                <div className="side-controls left">
                    <button className="control-btn"><i className="fas fa-arrows-alt-h" aria-hidden="true"></i> Upscale</button>
                </div>
                <div className="side-controls right">
                    <button className="control-btn-icon" aria-label="Magic edit"><i className="fas fa-magic"></i></button>
                    <button className="control-btn-icon" aria-label="Copy"><i className="far fa-clone"></i></button>
                    <button className="control-btn-icon" aria-label="Save to folder"><i className="far fa-folder"></i></button>
                    <button className="control-btn-icon" aria-label="Download"><i className="fas fa-download"></i></button>
                    <button className="control-btn-icon" aria-label="Delete"><i className="fas fa-trash-alt"></i></button>
                    <button className="control-btn-icon" aria-label="More options"><i className="fas fa-ellipsis-h"></i></button>
                </div>
            </div>
            <div className="prompt-bar">
                <div className="prompt-input-area">
                    <img src="https://i.imgur.com/Q9q2b6T.png" alt="user avatar" className="prompt-avatar" />
                    <button className="add-image-btn"><i className="fas fa-image"></i> Add Image</button>
                    <span className="prompt-text">Mix this image with another one attached...</span>
                </div>
                <div className="prompt-actions">
                    <button className="image-count-selector">
                        <i className="fas fa-images"></i>
                        <span>2</span>
                        <i className="fas fa-chevron-down"></i>
                    </button>
                    <button className="settings-btn" aria-label="Generation settings"><i className="fas fa-sliders-h"></i></button>
                    <button className="generate-btn">
                        Generate
                        <span className="cost"><i className="fas fa-coins" aria-hidden="true"></i> 172</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

function PlaceholderPage({ title }) {
  return <h1>{title}</h1>;
}

const orgSettingsNavItems = [
    { id: 'basic-info', name: 'Basic Info' },
    { id: 'domain', name: 'Domain' },
    { id: 'social', name: 'Social' },
    { id: 'subscription', name: 'Subscription' },
    { id: 'staff', name: 'Staff' },
    { id: 'country', name: 'Country' },
    { id: 'notifications', name: 'Notifications' },
    { id: 'checkout-settings', name: 'Checkout Settings' },
    { id: 'payment-providers', name: 'Payment Providers' },
];

function OrganizationSettings() {
    const [orgName, setOrgName] = useState("FOR TUNES");
    const [description, setDescription] = useState("Quality pop-up tribal, melodic tech and house events. Cross-promotion and elevating brands and the music community.");

    return (
        <div className="organization-settings">
            <div className="settings-card">
                <div className="settings-section-header">
                    <h2>Organization</h2>
                    <p>Add your organization details here.</p>
                </div>
                <div className="settings-form-group">
                    <label htmlFor="org-name">Name</label>
                    <input type="text" id="org-name" value={orgName} onChange={(e) => setOrgName(e.target.value)} />
                </div>
                <div className="settings-form-group">
                    <label>Logo</label>
                    <div className="logo-upload-section">
                        <img src="https://i.imgur.com/eQ9g54m.png" alt="Organization Logo" className="logo-preview" />
                        <div className="logo-actions">
                            <div>
                                <button className="btn-secondary">Replace</button>
                                <button className="btn-tertiary">Delete</button>
                            </div>
                            <p className="help-text">HEIC, WEBP, SVG, PNG, or JPG Recommended. 256x256 pixels minimum.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="settings-card">
                 <div className="settings-section-header">
                    <h2>Description</h2>
                    <p>Craft a compelling narrative for your organization's mission and vision.</p>
                 </div>
                 <div className="description-editor">
                    <div className="toolbar">
                        <button type="button" aria-label="Bold"><i className="fas fa-bold"></i></button>
                        <button type="button" aria-label="Italic"><i className="fas fa-italic"></i></button>
                        <button type="button" aria-label="Underline"><i className="fas fa-underline"></i></button>
                        <button type="button" aria-label="Unordered List"><i className="fas fa-list-ul"></i></button>
                        <button type="button" aria-label="Ordered List"><i className="fas fa-list-ol"></i></button>
                        <button type="button" aria-label="Link"><i className="fas fa-link"></i></button>
                        <button type="button" aria-label="Image"><i className="fas fa-image"></i></button>
                        <button type="button" aria-label="YouTube"><i className="fab fa-youtube"></i></button>
                        <button type="button" aria-label="Video"><i className="fas fa-video"></i></button>
                    </div>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                    ></textarea>
                 </div>
            </div>

            <div className="settings-card">
                <div className="settings-section-header">
                    <h2>Banner</h2>
                    <p>Showcase your organization's essence with a captivating banner.</p>
                </div>
                <div className="banner-upload-section">
                    <img src="https://i.imgur.com/8z3OFaB.png" alt="Organization Banner" className="banner-preview" />
                </div>
            </div>
        </div>
    );
}

function DomainSettings() {
    const mockDomains = [
        { id: 'dom1', name: 'for-tunes.7am.events', isPrimary: true, status: 'active', redirectsTo: null },
        { id: 'dom2', name: 'nightrise.7am.events', isPrimary: false, status: 'active', redirectsTo: 'for-tunes.7am.events' }
    ];

    return (
        <div className="domain-settings">
            <header className="domain-settings-header">
                <div>
                    <h2>Domain</h2>
                    <p>Domain Management: Track and Manage All Your Domains in One Place</p>
                </div>
                <button className="btn-add-domain">Add domain</button>
            </header>
            <div className="domain-list">
                {mockDomains.map(domain => (
                    <div key={domain.id} className="domain-card">
                        <div className={`domain-card-icon-container ${domain.isPrimary ? 'primary' : ''}`}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M8.20312 5.84375C8.20312 4.42188 9.34375 3.28125 10.7656 3.28125H12.6094C15.1719 3.28125 17.25 5.35938 17.25 7.92188V7.92188C17.25 10.4844 15.1719 12.5625 12.6094 12.5625H8.20312" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M12.6094 12.5625H8.20312V18.1562C8.20312 19.5781 7.0625 20.7188 5.64062 20.7188H5.64062" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <div className="domain-info">
                            <div className="domain-name-wrapper">
                                <span className="domain-name">{domain.name}</span>
                                <a href={`https://${domain.name}`} target="_blank" rel="noopener noreferrer" className="domain-action-icon" aria-label={`Open ${domain.name} in a new tab`}>
                                    <i className="fas fa-external-link-alt"></i>
                                </a>
                                <span className="domain-status-indicator" aria-label="Active status"></span>
                            </div>
                            <p className="domain-description">
                                {domain.isPrimary ? 'Primary domain' : `Redirects to ${domain.redirectsTo}`}
                            </p>
                        </div>
                        <button className="btn-edit-domain">Edit</button>
                    </div>
                ))}
            </div>
        </div>
    );
}

function SocialSettings() {
    const initialLinks = [
        { id: 'website', platform: 'Website', icon: 'fas fa-globe', value: 'https://for-tunes.com' },
        { id: 'twitter', platform: 'Twitter', icon: 'fab fa-twitter', value: '' },
        { id: 'youtube', platform: 'YouTube', icon: 'fab fa-youtube', value: '' },
        { id: 'facebook', platform: 'Facebook', icon: 'fab fa-facebook-f', value: 'https://www.facebook.com/4tunevents' },
        { id: 'soundcloud', platform: 'SoundCloud', icon: 'fab fa-soundcloud', value: 'https://soundcloud.com/for_tunes' },
        { id: 'instagram', platform: 'Instagram', icon: 'fab fa-instagram', value: 'https://www.instagram.com/for__tunes/' },
    ];
    const [socialLinks, setSocialLinks] = useState(initialLinks);

    const handleLinkChange = (id, newValue) => {
        setSocialLinks(prevLinks =>
            prevLinks.map(link => (link.id === id ? { ...link, value: newValue } : link))
        );
    };

    return (
        <div className="settings-card social-settings-card">
            <div className="settings-section-header">
                <h2>Social Media Links</h2>
                <p>Let ticket buyers find you on social media.</p>
            </div>
            <div className="social-links-list">
                {socialLinks.map(link => (
                    <div key={link.id} className="social-link-input-group">
                        <i className={link.icon} aria-hidden="true"></i>
                        <input
                            type="text"
                            placeholder={link.platform}
                            value={link.value}
                            onChange={(e) => handleLinkChange(link.id, e.target.value)}
                            aria-label={`${link.platform} link`}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

function StaffSettings() {
    const mockStaff = [
        { id: 'staff1', name: 'Blair Robson', avatar: 'https://i.imgur.com/Q9q2b6T.png' },
        { id: 'staff2', name: 'Blair Robson', avatar: 'https://i.imgur.com/O6p3f0w.png' }
    ];

    return (
        <div className="staff-settings">
            <header className="staff-settings-header">
                <h2>Staff</h2>
                <button className="btn-add-staff">Add staff</button>
            </header>
            <div className="staff-management-card">
                <div className="settings-section-header">
                    <h2>Manage Your Members</h2>
                    <p>Oversee permissions, roles, and team dynamics all in one place.</p>
                </div>
                <div className="search-staff-wrapper">
                    <i className="fas fa-search search-icon" aria-hidden="true"></i>
                    <input type="text" placeholder="Search staff" className="search-staff-input" />
                </div>
                <div className="staff-list-header">
                    <span>Staff</span>
                    <span>Options</span>
                </div>
                <ul className="staff-list">
                    {mockStaff.map(member => (
                        <li key={member.id} className="staff-member-item">
                            <div className="staff-member-details">
                                <img src={member.avatar} alt={`${member.name}'s avatar`} className="staff-avatar" />
                                <span className="staff-name">{member.name}</span>
                            </div>
                            <button className="btn-delete-staff" aria-label={`Delete ${member.name}`}>
                                <i className="fas fa-trash-alt" aria-hidden="true"></i>
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

function CountrySettings() {
    const [country, setCountry] = useState("New Zealand");
    const [currency, setCurrency] = useState("NZD");

    return (
        <div className="country-settings">
            <header className="country-settings-header">
                <button className="btn-export-contacts">Export Contacts</button>
            </header>
            <div className="settings-card">
                <div className="settings-section-header">
                    <h2>Country</h2>
                    <p>Please note that the currency can only be changed before any tickets have been sold or are currently in checkout.</p>
                </div>
                <div className="country-form-grid">
                    <div className="settings-form-group">
                        <label htmlFor="country-select">Country</label>
                        <div className="select-wrapper">
                            <select id="country-select" className="settings-select" value={country} onChange={(e) => setCountry(e.target.value)}>
                                <option>New Zealand</option>
                                <option>Australia</option>
                                <option>United States</option>
                                <option>United Kingdom</option>
                            </select>
                        </div>
                    </div>
                     <div className="settings-form-group">
                        <label htmlFor="currency-select">Currency</label>
                        <div className="select-wrapper">
                            <select id="currency-select" className="settings-select" value={currency} onChange={(e) => setCurrency(e.target.value)}>
                                <option>NZD</option>
                                <option>AUD</option>
                                <option>USD</option>
                                <option>GBP</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function PaymentProvidersSettings() {
    const paymentProviders = [
        {
            id: 'stripe',
            name: 'Stripe',
            logo: 'https://i.imgur.com/q5x15Mh.png',
            description: 'We use Stripe Connect to onboard organisers through a secure Know Your Customer (KYC) process. This helps us create dedicated accounts for you to process payments, ensuring compliance, security, and smooth payouts directly to your bank account. While the onboarding requires some verification steps, it ensures that your transactions are protected and compliant with financial regulations. Our team is here to assist you every step of the way!',
            status: 'connected'
        },
    ];

    return (
        <div className="payment-providers-settings">
            <div className="payment-providers-list">
                {paymentProviders.map(provider => (
                    <div key={provider.id} className="provider-card">
                        <div className="provider-info">
                            <div className="provider-logo-container">
                                <img src={provider.logo} alt={`${provider.name} logo`} className="provider-logo" />
                            </div>
                            <p className="provider-description">{provider.description}</p>
                            <div className="provider-footer">
                                <span className={`status-badge ${provider.status}`}>{provider.status.toUpperCase()}</span>
                                <button className="btn-provider-action">
                                    {provider.status === 'connected' ? 'Edit' : 'Connect'}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}


function OrgSettingsPage({ activeSection, onSectionSelect }) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const activeItem = orgSettingsNavItems.find(item => item.id === activeSection);

    return (
        <div className="settings-container">
            <button
                className={`settings-accordion-header ${isDropdownOpen ? 'open' : ''}`}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                aria-expanded={isDropdownOpen}
                aria-controls="settings-dropdown"
            >
                <span>{activeItem?.name}</span>
                <i className="fas fa-chevron-down" aria-hidden="true"></i>
            </button>
            {isDropdownOpen && (
                <div className="settings-dropdown" id="settings-dropdown">
                    <ul>
                        {orgSettingsNavItems.map(item => (
                            <li key={item.id}>
                                <button
                                    className={`settings-dropdown-item ${activeSection === item.id ? 'active' : ''}`}
                                    onClick={() => {
                                        onSectionSelect(item.id);
                                        setIsDropdownOpen(false);
                                    }}
                                >
                                    {item.name}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            <div className="settings-frame">
                <div className="settings-content">
                  {activeSection === 'basic-info'
                    ? <OrganizationSettings />
                    : activeSection === 'domain'
                    ? <DomainSettings />
                    : activeSection === 'social'
                    ? <SocialSettings />
                    : activeSection === 'staff'
                    ? <StaffSettings />
                    : activeSection === 'country'
                    ? <CountrySettings />
                    : activeSection === 'payment-providers'
                    ? <PaymentProvidersSettings />
                    : <PlaceholderPage title={`Manage ${activeItem?.name}`} />
                  }
                </div>
            </div>
        </div>
    );
}

function UserSettings({ user, onSave }) {
  const [formData, setFormData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    avatar: user.avatar,
  });

  const handleSave = () => {
    onSave(formData);
    // In a real app, you'd show a success message
    alert('Settings saved!');
  };

  return (
    <div className="user-settings-content-card">
      <div className="user-settings-header">
        <h2>User</h2>
        <p>Update your name and profile picture. Click "Save" to apply changes.</p>
      </div>
      <div className="user-settings-form-grid">
        <div className="user-settings-form-group">
          <label htmlFor="first-name">First name</label>
          <input
            type="text"
            id="first-name"
            value={formData.firstName}
            onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
          />
        </div>
        <div className="user-settings-form-group">
          <label htmlFor="last-name">Last name</label>
          <input
            type="text"
            id="last-name"
            value={formData.lastName}
            onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
          />
        </div>
      </div>
      <div className="user-settings-form-group">
        <div className="avatar-upload-section">
          <img src={formData.avatar} alt="User Avatar" className="avatar-preview" />
          <div className="avatar-actions">
            <div>
              <button className="btn-secondary">Replace</button>
              <button className="btn-tertiary">Delete</button>
            </div>
            <p className="help-text">HEIC, WEBP, SVG, PNG, or JPG Recommended. 264x264 pixels minimum.</p>
          </div>
        </div>
      </div>
      <div className="user-settings-footer">
        <button className="btn-save-settings" onClick={handleSave}>Save</button>
      </div>
    </div>
  );
}

function SettingsPage({ user, onSaveUser }) {
  const [activeTab, setActiveTab] = useState('user');

  return (
    <div className="settings-page-container">
      <h1 className="settings-page-title">Settings</h1>
      <div className="settings-page-layout">
        <nav className="settings-page-nav">
          <ul>
            <li>
              <button className={activeTab === 'user' ? 'active' : ''} onClick={() => setActiveTab('user')}>User</button>
            </li>
            <li>
              <button className={activeTab === 'language' ? 'active' : ''} onClick={() => setActiveTab('language')}>Language</button>
            </li>
            <li>
              <button className={activeTab === 'appearance' ? 'active' : ''} onClick={() => setActiveTab('appearance')}>Appearance</button>
            </li>
          </ul>
        </nav>
        <div className="settings-page-content">
          {activeTab === 'user' && <UserSettings user={user} onSave={onSaveUser} />}
          {activeTab === 'language' && <PlaceholderPage title="Language Settings" />}
          {activeTab === 'appearance' && <PlaceholderPage title="Appearance Settings" />}
        </div>
      </div>
    </div>
  );
}


// --- MAIN APP COMPONENT ---

const topLevelNav = [
  { id: 'dashboard', name: 'Dashboard', icon: 'fas fa-tachometer-alt' },
  { id: 'events', name: 'Events', icon: 'fas fa-calendar-check' },
  { id: 'inventory', name: 'Inventory', icon: 'fas fa-boxes-stacked' },
];

const baseEventSubNav = [
  { id: 'ticketing', name: 'Ticketing', icon: 'fas fa-ticket-alt' },
  { id: 'payments', name: 'Payments', icon: 'fas fa-credit-card' },
  { id: 'contracts', name: 'DJ Contracts', icon: 'fas fa-file-contract' },
  { id: 'budget', name: 'Budget', icon: 'fas fa-calculator' },
  { id: 'kanban', name: 'Project Board', icon: 'fas fa-tasks' },
  { id: 'marketing', name: 'Marketing', icon: 'fas fa-bullhorn' },
];

const inventorySubNav = [
    { id: 'equipment', name: 'Equipment', icon: 'fas fa-music' },
    { id: 'artists', name: 'Artists', icon: 'fas fa-microphone' },
];

function App({ currentUser, onLogout, onSaveUser, initialData, onUpdateData }) {
  // Data comes from props
  const { organisations, events, artists, equipment, eventInventory, tickets, kanbanData, budgets, paymentsData } = initialData;

  // UI State
  const [selectedOrganisationId, setSelectedOrganisationId] = useState(organisations[0]?.id || null);
  const [activeTopLevel, setActiveTopLevel] = useState(organisations.length > 0 ? 'dashboard' : 'events');
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [activeSubMenu, setActiveSubMenu] = useState(null);
  const [activeOrgSettingsSection, setActiveOrgSettingsSection] = useState('basic-info');
  const [isOrgDropdownOpen, setIsOrgDropdownOpen] = useState(false);
  const [isSidebarPinned, setIsSidebarPinned] = useState(true);
  const [isCreatingOrg, setIsCreatingOrg] = useState(false);
  const [eventsView, setEventsView] = useState('list'); // 'list', 'create', 'setup'
  const [eventBeingSetup, setEventBeingSetup] = useState(null);
  
  const [showAddToEventModal, setShowAddToEventModal] = useState(false);
  const [itemToAdd, setItemToAdd] = useState({ item: null, type: '' });
  
  const orgSwitcherRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (orgSwitcherRef.current && !orgSwitcherRef.current.contains(event.target)) {
        setIsOrgDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [orgSwitcherRef]);

  const organisationEvents = events.filter(e => e.organisationId === selectedOrganisationId);
  const organisationArtists = artists.filter(a => a.organisationId === selectedOrganisationId);
  const organisationEquipment = equipment.filter(e => e.organisationId === selectedOrganisationId);
  const selectedEvent = selectedEventId ? organisationEvents.find(e => e.id === selectedEventId) : null;
  const selectedOrganisation = selectedOrganisationId ? organisations.find(org => org.id === selectedOrganisationId) : null;

  const toggleSidebarPin = () => setIsSidebarPinned(prev => !prev);

  const handleOrganisationChange = (organisationId) => {
    if (isCreatingOrg) setIsCreatingOrg(false);
    setSelectedOrganisationId(organisationId);
    setActiveTopLevel('dashboard');
    setSelectedEventId(null);
    setActiveSubMenu(null);
  };

  const handleTopLevelClick = (id) => {
    if (isCreatingOrg) setIsCreatingOrg(false);
    setActiveTopLevel(id);
    setSelectedEventId(null);
    setActiveSubMenu(id === 'inventory' ? 'equipment' : null);
    if (id === 'events') {
        setEventsView('list');
        setEventBeingSetup(null);
    }
  };
  
  const handleOrgSettingsClick = () => {
    if (isCreatingOrg) setIsCreatingOrg(false);
    setActiveTopLevel('orgSettings');
    setActiveOrgSettingsSection('basic-info');
    setSelectedEventId(null);
    setActiveSubMenu(null);
  };
  
  const handleUserSettingsClick = () => {
    if (isCreatingOrg) setIsCreatingOrg(false);
    setActiveTopLevel('userSettings');
    setSelectedEventId(null);
    setActiveSubMenu(null);
  };

  const handleSelectEvent = (eventId) => {
    setSelectedEventId(eventId);
    setActiveSubMenu('ticketing'); // Default to first event sub-item
  };

  const handleSubMenuClick = (id) => {
    // If user clicks on 'Setup', do nothing because they are already there.
    // The 'Setup' button only appears when they are on that page.
    if (id === 'setup') {
      return;
    }

    // For any other sub-menu item, exit the setup view if we are in it.
    if (eventsView === 'setup' || eventBeingSetup) {
      setEventsView('list');
      setEventBeingSetup(null);
    }
    setActiveSubMenu(id);
  };

  const handleShowCreateOrg = () => {
    setIsOrgDropdownOpen(false);
    setIsCreatingOrg(true);
    setActiveTopLevel(null);
    setSelectedEventId(null);
    setActiveSubMenu(null);
  };

  const handleCreateOrganisation = (newOrgData) => {
    const newOrg = {
      ...newOrgData,
      id: `org${Date.now()}`,
      logo: null,
    };
    onUpdateData({ organisations: [...organisations, newOrg] });
    
    setIsCreatingOrg(false);
    setSelectedOrganisationId(newOrg.id);
    setActiveTopLevel('dashboard');
    setSelectedEventId(null);
    setActiveSubMenu(null);
  };

  const handleCancelCreateOrg = () => {
    setIsCreatingOrg(false);
    if(organisations.length > 0) {
      setActiveTopLevel('dashboard');
    }
  };

  const handleCreateEvent = (newEventData) => {
    const newEvent = {
        ...newEventData,
        id: `ev${Date.now()}`
    };

    // Create empty data structures for the new event
    const newKanbanData = {
        ...kanbanData,
        [newEvent.id]: {
            columns: [
                { id: 'col1', title: 'To Do', cards: [] },
                { id: 'col2', title: 'In Progress', cards: [] },
                { id: 'col3', title: 'Done', cards: [] }
            ]
        }
    };
    
    const newBudgets = {
        ...budgets,
        [newEvent.id]: {
            sections: []
        }
    };
    
    const newPaymentsData = {
        ...paymentsData,
        [newEvent.id]: {
            stats: [
                { label: 'Tickets Sold', value: 0, icon: 'fas fa-ticket-alt' },
                { label: 'Net Revenue', value: 'NZ$0', icon: 'fas fa-dollar-sign' },
                { label: 'Referral Rebates', value: 'NZ$0', icon: 'fas fa-users' },
                { label: 'Tickets in Carts', value: 0, icon: 'fas fa-shopping-cart' },
                { label: 'Tickets Locked', value: 0, icon: 'fas fa-lock' },
                { label: 'Buyers', value: 0, icon: 'fas fa-user-friends' },
            ],
            ticketSales: {
                quantity: Array(12).fill(0),
                revenue: Array(12).fill(0)
            },
            stripe: {
                today: { net: 'NZ$0', yesterday: 'NZ$0' },
                salesVolume: { net: 'NZ$0', prev: 'NZ$0', change: '+0.0%' },
                newCustomers: { count: 0, prev: 0, change: '+0.0%' }
            }
        }
    };

    onUpdateData({ 
        events: [...events, newEvent],
        kanbanData: newKanbanData,
        budgets: newBudgets,
        paymentsData: newPaymentsData,
    });
    
    setEventBeingSetup(newEvent);
    setEventsView('setup');
    setSelectedEventId(newEvent.id);
    setActiveSubMenu('setup');
  };
  
  const handleAddArtist = (newArtistData) => {
    const newArtist = {
        ...newArtistData,
        id: `art${Date.now()}`,
        organisationId: selectedOrganisationId,
    };
    onUpdateData({ artists: [...artists, newArtist] });
  };

  const handleAddEquipment = (newEquipmentData) => {
    const newEquipment = {
        ...newEquipmentData,
        id: `eq${Date.now()}`,
        organisationId: selectedOrganisationId,
    };
    onUpdateData({ equipment: [...equipment, newEquipment] });
  };
  
  const handleShowAddToEventModal = (item, type) => {
    setItemToAdd({ item, type });
    setShowAddToEventModal(true);
  };

  const handleAddItemToEvent = (eventId, item, itemType) => {
    const newInventory = JSON.parse(JSON.stringify(eventInventory)); // Deep copy
    if (!newInventory[eventId]) {
        newInventory[eventId] = { artists: [], equipment: [] };
    }

    if (itemType === 'artist') {
        if (!newInventory[eventId].artists.some(artist => artist.id === item.id)) {
            newInventory[eventId].artists.push({ id: item.id, status: 'Pending' });
        }
    } else if (itemType === 'equipment') {
        if (!newInventory[eventId].equipment.includes(item.id)) {
            newInventory[eventId].equipment.push(item.id);
        }
    }
    
    onUpdateData({ eventInventory: newInventory });
    setShowAddToEventModal(false);
    setItemToAdd({ item: null, type: '' });
  };

  const handleUpdateContractStatus = (eventId, artistId, newStatus) => {
      const newInventory = JSON.parse(JSON.stringify(eventInventory));
      const eventArtists = newInventory[eventId]?.artists;
      if (eventArtists) {
          const artistIndex = eventArtists.findIndex(a => a.id === artistId);
          if (artistIndex > -1) {
              eventArtists[artistIndex].status = newStatus;
          }
      }
      onUpdateData({ eventInventory: newInventory });
  };

  const handleAddTicket = (eventId, newTicketData) => {
    const newTickets = { ...tickets };
    const eventTickets = newTickets[eventId] || [];
    const newTicket = {
      ...newTicketData,
      id: `t${Date.now()}`,
      order: eventTickets.length + 1,
      sold: 0,
    };
    newTickets[eventId] = [...eventTickets, newTicket];
    onUpdateData({ tickets: newTickets });
  };

  const handleDeleteTicket = (eventId, ticketId) => {
    const newTickets = { ...tickets };
    if (newTickets[eventId]) {
      newTickets[eventId] = newTickets[eventId].filter(t => t.id !== ticketId)
        .map((t, index) => ({ ...t, order: index + 1 })); // Re-order
    }
    onUpdateData({ tickets: newTickets });
  };

  const handleCardMove = (eventId, sourceColId, destColId, cardId) => {
    const newKanbanData = JSON.parse(JSON.stringify(kanbanData));
    const board = newKanbanData[eventId];
    if (!board) return;

    const sourceCol = board.columns.find(c => c.id === sourceColId);
    const destCol = board.columns.find(c => c.id === destColId);
    
    if (!sourceCol || !destCol) return;
    
    const cardIndex = sourceCol.cards.findIndex(c => c.id === cardId);
    if (cardIndex === -1) return;

    const [movedCard] = sourceCol.cards.splice(cardIndex, 1);
    destCol.cards.push(movedCard);
    
    onUpdateData({ kanbanData: newKanbanData });
  };

  const handleAddCard = (eventId, columnId, content) => {
    const newKanbanData = JSON.parse(JSON.stringify(kanbanData));
    
    if (!newKanbanData[eventId]) {
        newKanbanData[eventId] = {
            columns: [
                { id: 'col1', title: 'To Do', cards: [] },
                { id: 'col2', title: 'In Progress', cards: [] },
                { id: 'col3', title: 'Done', cards: [] }
            ]
        };
    }

    const board = newKanbanData[eventId];
    const column = board.columns.find(c => c.id === columnId);
    if (!column) return;
    
    const newCard = {
        id: `card${Date.now()}`,
        content,
    };
    column.cards.push(newCard);
    
    onUpdateData({ kanbanData: newKanbanData });
  };

  const renderContent = () => {
    if (organisations.length === 0 && !isCreatingOrg) {
        return (
            <div className="empty-state-container">
                <button className="btn-large-create" onClick={handleShowCreateOrg}>
                    Create Organisation
                </button>
            </div>
        );
    }

    if (isCreatingOrg) {
        return <CreateOrganisationPage
            onCreate={handleCreateOrganisation}
            onBack={handleCancelCreateOrg}
        />
    }

    if (activeTopLevel === 'dashboard') return <Dashboard />;
    
    if (activeTopLevel === 'orgSettings') {
      return <OrgSettingsPage activeSection={activeOrgSettingsSection} onSectionSelect={setActiveOrgSettingsSection} />;
    }
    
    if (activeTopLevel === 'userSettings') {
      return <SettingsPage user={currentUser} onSaveUser={onSaveUser} />;
    }

    if (activeTopLevel === 'events') {
      if (eventsView === 'create') {
        return <CreateEventPage 
            organisations={organisations}
            onCreate={handleCreateEvent}
            onBack={() => setEventsView('list')}
        />
      }

      if (eventsView === 'setup' && eventBeingSetup) {
        return <EventSetupPage
            event={eventBeingSetup}
            organisations={organisations}
            onBack={() => {
                setEventsView('list');
                setEventBeingSetup(null);
            }}
        />
      }

      if (selectedEvent && activeSubMenu) {
        if (activeSubMenu === 'ticketing') {
            return <TicketsPage
                event={selectedEvent}
                eventTickets={tickets[selectedEvent.id] || []}
                onAddTicket={handleAddTicket}
                onDeleteTicket={handleDeleteTicket}
            />
        }
        if (activeSubMenu === 'payments') {
            const paymentData = paymentsData[selectedEvent.id];
            if (!paymentData) return <div className="placeholder-container"><h3>No payment data found for this event.</h3></div>;
            return <PaymentsPage event={selectedEvent} data={paymentData} />;
        }
        if (activeSubMenu === 'marketing') {
            return <MarketingPage />;
        }
        if (activeSubMenu === 'eventory') {
            return <EventoryPage
                eventInventory={eventInventory[selectedEvent.id] || { artists: [], equipment: [] }}
                allArtists={artists}
                allEquipment={equipment}
            />;
        }
        if (activeSubMenu === 'contracts') {
            return <DJContractsPage 
                event={selectedEvent}
                contractedArtists={eventInventory[selectedEvent.id]?.artists || []}
                allArtists={artists}
                onUpdateStatus={handleUpdateContractStatus}
            />
        }
        if (activeSubMenu === 'kanban') {
            const boardData = kanbanData[selectedEvent.id];
            const displayBoard = boardData || {
                columns: [
                    { id: 'col1', title: 'To Do', cards: [] },
                    { id: 'col2', title: 'In Progress', cards: [] },
                    { id: 'col3', title: 'Done', cards: [] }
                ]
            };
            return <KanbanPage
                board={displayBoard}
                onCardMove={(sourceColId, destColId, cardId) => handleCardMove(selectedEvent.id, sourceColId, destColId, cardId)}
                onCardAdd={(columnId, content) => handleAddCard(selectedEvent.id, columnId, content)}
            />
        }
        if (activeSubMenu === 'budget') {
            const budgetData = budgets[selectedEvent.id];
            if (!budgetData) return <div className="placeholder-container"><h3>No budget found for this event.</h3></div>;
            return <BudgetPage budget={budgetData} />;
        }
        const item = baseEventSubNav.find(i => i.id === activeSubMenu);
        return <PlaceholderPage title={`${item.name} for ${selectedEvent.name}`} />;
      }
      return (
        <div className="placeholder-container">
            <h2>Manage Events</h2>
            <p>Select an event from the sidebar or create a new one to get started.</p>
        </div>
      );
    }

    if (activeTopLevel === 'inventory' && activeSubMenu) {
       if (activeSubMenu === 'artists') {
         return <ArtistsPage 
            artists={organisationArtists}
            onAddArtist={handleAddArtist}
            onAddToEvent={handleShowAddToEventModal}
         />;
       }
       if (activeSubMenu === 'equipment') {
         return <EquipmentPage 
            equipment={organisationEquipment}
            onAddEquipment={handleAddEquipment}
            onAddToEvent={handleShowAddToEventModal}
         />;
       }
    }
    
    return <h1>Welcome</h1>;
  };
  
  const getEventSubNav = () => {
    let navItems = [...baseEventSubNav];

    if (eventBeingSetup && eventBeingSetup.id === selectedEventId) {
        navItems.unshift({ id: 'setup', name: 'Event Setup', icon: 'fas fa-cogs' });
    }

    if (selectedEventId && eventInventory[selectedEventId] && (eventInventory[selectedEventId].artists.length > 0 || eventInventory[selectedEventId].equipment.length > 0)) {
      navItems.push({ id: 'eventory', name: 'Eventory', icon: 'fas fa-clipboard-list' });
    }
    return navItems;
  };
  

  const isFullBleedView = (activeTopLevel === 'events' && (eventsView === 'create' || eventsView === 'setup')) || isCreatingOrg || organisations.length === 0;
  const isMarketingView = activeTopLevel === 'events' && selectedEvent && activeSubMenu === 'marketing';
  const isTicketsView = activeTopLevel === 'events' && selectedEvent && activeSubMenu === 'ticketing';
  const isKanbanView = activeTopLevel === 'events' && selectedEvent && activeSubMenu === 'kanban';
  const isBudgetView = activeTopLevel === 'events' && selectedEvent && activeSubMenu === 'budget';
  const isPaymentsView = activeTopLevel === 'events' && selectedEvent && activeSubMenu === 'payments';
  const isSettingsView = activeTopLevel === 'userSettings' || activeTopLevel === 'orgSettings';


  return (
    <div className={`app-container ${isSidebarPinned ? 'sidebar-pinned' : 'sidebar-minimized'}`}>
      {showAddToEventModal && (
        <AddToEventModal
            item={itemToAdd.item}
            itemType={itemToAdd.type}
            events={organisationEvents}
            onSave={handleAddItemToEvent}
            onCancel={() => setShowAddToEventModal(false)}
        />
      )}
      <aside className="sidebar">
        <div className="sidebar-header">
            <div className="profile-bar">
                <div 
                  className="profile"
                  role="button" 
                  tabIndex={0} 
                  onClick={handleUserSettingsClick} 
                  onKeyDown={(e) => e.key === 'Enter' && handleUserSettingsClick()}
                  aria-label="User Settings"
                >
                  <img src={currentUser.avatar} alt="user avatar" className="profile-avatar" />
                  <span className="username">{currentUser.firstName} {currentUser.lastName}</span>
                </div>
                <button 
                    className="pin-toggle-btn" 
                    onClick={toggleSidebarPin} 
                    aria-label={isSidebarPinned ? "Minimize sidebar" : "Pin sidebar"}
                >
                    <i className="fas fa-angles-left"></i>
                </button>
            </div>
            <div className="org-switcher" ref={orgSwitcherRef}>
              <button
                className="org-switcher-trigger"
                onClick={() => setIsOrgDropdownOpen(!isOrgDropdownOpen)}
                aria-haspopup="true"
                aria-expanded={isOrgDropdownOpen}
              >
                {selectedOrganisation ? (<>
                    {selectedOrganisation.logo ? (
                      <img src={selectedOrganisation.logo} alt={`${selectedOrganisation.name} logo`} className="organisation-logo" />
                    ) : (
                      <div className="organisation-logo-placeholder">
                          <i className="fas fa-building" aria-hidden="true"></i>
                      </div>
                    )}
                    <div className="organisation-details">
                      <span className="organisation-name">{selectedOrganisation.name}</span>
                      <span className="organisation-id">ID: 530</span>
                    </div>
                    <div className="org-switcher-icons">
                       <button className="settings-icon-btn" onClick={(e) => { e.stopPropagation(); handleOrgSettingsClick(); }} aria-label="Organisation Settings">
                          <i className="fas fa-cog" aria-hidden="true"></i>
                       </button>
                       <i className={`fas fa-chevron-down dropdown-arrow ${isOrgDropdownOpen ? 'open' : ''}`}></i>
                    </div>
                </>) : (<>
                    <div className="organisation-logo-placeholder">
                        <i className="fas fa-building" aria-hidden="true"></i>
                    </div>
                    <div className="organisation-details">
                      <span className="organisation-name">No Organisation</span>
                    </div>
                     <div className="org-switcher-icons">
                       <i className={`fas fa-chevron-down dropdown-arrow ${isOrgDropdownOpen ? 'open' : ''}`}></i>
                    </div>
                </>)}
              </button>
              {isOrgDropdownOpen && (
                <div className="org-dropdown">
                  <button className="create-organisation-btn" onClick={handleShowCreateOrg}>Create Organisation</button>
                  <div className="org-dropdown-list">
                    {organisations.map(org => (
                      <button
                        key={org.id}
                        className={`organisation-item ${selectedOrganisationId === org.id ? 'active' : ''}`}
                        onClick={() => {
                          handleOrganisationChange(org.id);
                          setIsOrgDropdownOpen(false);
                        }}
                      >
                        {org.logo ? (
                          <img src={org.logo} alt={`${org.name} logo`} className="organisation-logo" />
                        ) : (
                          <div className="organisation-logo-placeholder">
                            <i className="fas fa-building" aria-hidden="true"></i>
                          </div>
                        )}
                        <div className="organisation-details">
                          <span className="organisation-name">{org.name}</span>
                          <span className="organisation-id">ID: 530</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
        </div>
        
        <nav className="sidebar-nav" aria-label="Main Navigation">
           {selectedEventId ? (
            <>
              <button className="nav-item back-button" onClick={() => handleTopLevelClick('events')}>
                <i className="fas fa-chevron-left" aria-hidden="true"></i>
                <span>Back</span>
              </button>
              <div className="sidebar-event-header">{selectedEvent?.name}</div>
              <ul className="sub-nav">
                {getEventSubNav().map(subItem => (
                  <li key={subItem.id}>
                    <button className={`nav-item sub-item ${activeSubMenu === subItem.id ? 'active' : ''}`} onClick={() => handleSubMenuClick(subItem.id)}>
                      <i className={subItem.icon} aria-hidden="true"></i>
                      <span>{subItem.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <ul>
              {topLevelNav.map((item) => (
                <li key={item.id}>
                   <button 
                    className={`nav-item ${activeTopLevel === item.id ? 'active' : ''}`} 
                    onClick={() => handleTopLevelClick(item.id)}
                    disabled={organisations.length === 0 && item.id !== 'events'}
                   >
                    <div className="nav-item-main">
                        <i className={item.icon} aria-hidden="true"></i>
                        <span>{item.name}</span>
                    </div>
                    {item.id === 'events' && activeTopLevel === 'events' && !selectedEventId && eventsView === 'list' && organisations.length > 0 && (
                        <button 
                            className="btn-add-event-sidebar" 
                            onClick={(e) => { e.stopPropagation(); setEventsView('create'); }} 
                            aria-label="Create new event"
                        >
                            <i className="fas fa-plus"></i>
                        </button>
                    )}
                  </button>
                  {item.id === 'events' && activeTopLevel === 'events' && organisations.length > 0 && (
                    <ul className="sub-nav">
                      {organisationEvents.length > 0 ? organisationEvents.map(event => (
                        <li key={event.id}>
                          <button
                            className={`nav-item sub-item ${selectedEventId === event.id ? 'active' : ''}`}
                            onClick={() => handleSelectEvent(event.id)}>
                             <i className="fas fa-compact-disc" aria-hidden="true"></i>
                             <span>{event.name}</span>
                          </button>
                        </li>
                      )) : (
                        <li className="no-events-message">No events found.</li>
                      )}
                    </ul>
                  )}
                  {item.id === 'inventory' && activeTopLevel === 'inventory' && (
                    <ul className="sub-nav">
                      {inventorySubNav.map(subItem => (
                        <li key={subItem.id}>
                          <button className={`nav-item sub-item ${activeSubMenu === subItem.id ? 'active' : ''}`} onClick={() => setActiveSubMenu(subItem.id)}>
                             <i className={subItem.icon} aria-hidden="true"></i>
                             <span>{subItem.name}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          )}
        </nav>
        <div className="sidebar-footer">
            <button className="nav-item" onClick={onLogout}>
                <i className="fas fa-sign-out-alt"></i>
                <span>Logout</span>
            </button>
        </div>
      </aside>
      <main className={`main-content ${isSettingsView ? 'settings-view' : ''} ${isFullBleedView ? 'full-bleed' : ''} ${isMarketingView ? 'marketing-view' : ''} ${isTicketsView ? 'tickets-view' : ''} ${isKanbanView ? 'kanban-view' : ''} ${isBudgetView ? 'budget-view' : ''} ${isPaymentsView ? 'payments-view' : ''}`}>
        {renderContent()}
      </main>
    </div>
  );
}

function LoginPage({ onLogin, onRegister }) {
  const [isRegisterView, setIsRegisterView] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    const success = onLogin({ email, password });
    if (!success) {
      setError('Invalid email or password.');
    }
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!firstName || !lastName || !email || !password) {
      setError('Please fill out all fields.');
      return;
    }
    onRegister({ firstName, lastName, email, password });
  };
  
  const toggleView = () => {
    setIsRegisterView(!isRegisterView);
    setError('');
    // Clear form fields
    setEmail('');
    setPassword('');
    setFirstName('');
    setLastName('');
  };

  return (
    <div className="login-page-container">
      <img src="https://i.ibb.co/YB8kr4L9/eventflow.png" alt="EventFlow Logo" className="login-logo" />
      <div className="login-form-wrapper">
        <h2 className="login-title">{isRegisterView ? 'Create Account' : 'Log In'}</h2>
        <p className="login-subtitle">
          {isRegisterView ? 'Start managing your events with ease.' : 'Welcome back! Please enter your details.'}
        </p>
        
        {error && <p className="login-error">{error}</p>}
        
        <form onSubmit={isRegisterView ? handleRegisterSubmit : handleLoginSubmit} className="login-form">
          {isRegisterView && (
            <>
              <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <input type="text" id="firstName" value={firstName} onChange={e => setFirstName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label htmlFor="lastName">Last Name</label>
                <input type="text" id="lastName" value={lastName} onChange={e => setLastName(e.target.value)} required />
              </div>
            </>
          )}
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn-primary login-button">
            {isRegisterView ? 'Register' : 'Log In'}
          </button>
        </form>

        <p className="login-toggle-text">
          {isRegisterView ? 'Already have an account?' : "Don't have an account?"}
          <button onClick={toggleView} className="login-toggle-button">
            {isRegisterView ? 'Log In' : 'Register'}
          </button>
        </p>
      </div>
    </div>
  );
}

function AppWrapper() {
  const [users, setUsers] = useState(mockData.users);
  const [currentUser, setCurrentUser] = useState(null);

  const [allUserData, setAllUserData] = useState({
    'user1': {
      organisations: mockData.organisations,
      events: mockData.initialEvents,
      artists: mockData.inventory.artists,
      equipment: mockData.inventory.equipment,
      eventInventory: {},
      tickets: mockData.tickets,
      kanbanData: mockData.kanban,
      budgets: mockData.budgets,
      paymentsData: mockData.payments,
    }
  });

  const getEmptyUserData = () => ({
    organisations: [],
    events: [],
    artists: [],
    equipment: [],
    eventInventory: {},
    tickets: {},
    kanbanData: {},
    budgets: {},
    paymentsData: {},
  });


  const handleLogin = (credentials) => {
    const user = users.find(u => u.email === credentials.email && u.password === credentials.password);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const handleRegister = (newUserData) => {
    const existingUser = users.find(u => u.email === newUserData.email);
    if (existingUser) {
      alert("An account with this email already exists.");
      return;
    }
    const newUser = {
      ...newUserData,
      id: `user${Date.now()}`,
      avatar: 'https://i.imgur.com/O6p3f0w.png' // Default avatar
    };
    setUsers(prev => [...prev, newUser]);
    setAllUserData(prev => ({
      ...prev,
      [newUser.id]: getEmptyUserData()
    }));
    setCurrentUser(newUser); // Auto-login after registration
  };
  
  const handleSaveUser = (updatedUserData) => {
      const updatedUser = { ...currentUser, ...updatedUserData };
      setCurrentUser(updatedUser);
      setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };
  
  const handleUpdateCurrentUserData = (updatedData) => {
    if (!currentUser) return;
    setAllUserData(prev => ({
        ...prev,
        [currentUser.id]: {
            ...(prev[currentUser.id] || getEmptyUserData()),
            ...updatedData,
        }
    }));
  };

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} onRegister={handleRegister} />;
  }

  const currentUserData = allUserData[currentUser.id] || getEmptyUserData();

  return <App 
    key={currentUser.id}
    currentUser={currentUser} 
    onLogout={handleLogout} 
    onSaveUser={handleSaveUser}
    initialData={currentUserData}
    onUpdateData={handleUpdateCurrentUserData}
  />;
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<AppWrapper />);