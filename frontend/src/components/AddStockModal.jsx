import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { getAllMedicines, addStockIn } from '../services/api';
import toast from 'react-hot-toast';

const AddStockModal = ({ isOpen, onClose, onRefresh }) => {
    const [medicines, setMedicines] = useState([]);
    const [formData, setFormData] = useState({
        medicine_id: '',
        batch_number: '',
        quantity: '',
        expiry_date: '',
        supplier_name: '',
        invoice_no: '',
        remarks: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadMedicines();
        }
    }, [isOpen]);

    const loadMedicines = async () => {
        try {
            const data = await getAllMedicines();
            setMedicines(Array.isArray(data) ? data : []);
        } catch (err) {
            // Mock fallback
            setMedicines([
                { medicine_id: 1, name: 'Paracetamol 500mg' },
                { medicine_id: 2, name: 'Amoxicillin 250mg' },
                { medicine_id: 3, name: 'Cetirizine' }
            ]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.medicine_id || !formData.batch_number || !formData.quantity || !formData.expiry_date) {
            return toast.error('Please fill required fields');
        }

        setLoading(true);
        try {
            await addStockIn({
                ...formData,
                quantity: Number(formData.quantity)
            });
            toast.success('Stock added successfully');
            onRefresh();
            onClose();
        } catch (err) {
            console.error('Add Stock Error:', err);
            const msg = err.response?.data?.message || 'Failed to add stock';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose} style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
            padding: '2rem', overflowY: 'auto'
        }}>
            <div onClick={e => e.stopPropagation()} className="fade-in" style={{
                width: '100%', maxWidth: '600px', padding: '2.5rem',
                maxHeight: '90vh', overflowY: 'auto', margin: 'auto', transform: 'none',
                background: 'white', borderRadius: '20px',
                boxShadow: '0 25px 60px rgba(0,0,0,0.15)'
            }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Record New Stock Arrival</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                        <X size={24} />
                    </button>
                </header>

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div className="input-group">
                            <label>Medicine Name *</label>
                            <select
                                value={formData.medicine_id}
                                onChange={(e) => setFormData({ ...formData, medicine_id: e.target.value })}
                                required
                            >
                                <option value="">Select Medicine</option>
                                {medicines.map(m => (
                                    <option key={m.medicine_id} value={m.medicine_id}>{m.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="input-group">
                            <label>Batch Number *</label>
                            <input
                                type="text"
                                placeholder="e.g. BKT-789"
                                value={formData.batch_number}
                                onChange={(e) => setFormData({ ...formData, batch_number: e.target.value })}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label>Quantity *</label>
                            <input
                                type="number"
                                placeholder="Units received"
                                value={formData.quantity}
                                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                required
                                min="1"
                            />
                        </div>


                        <div className="input-group">
                            <label>Expiry Date *</label>
                            <input
                                type="date"
                                value={formData.expiry_date}
                                onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                                required
                                min={new Date().toISOString().split('T')[0]}
                            />
                        </div>

                        <div className="input-group">
                            <label>Supplier Name</label>
                            <input
                                type="text"
                                placeholder="Name of distributor"
                                value={formData.supplier_name}
                                onChange={(e) => setFormData({ ...formData, supplier_name: e.target.value })}
                            />
                        </div>

                        <div className="input-group">
                            <label>Invoice Number</label>
                            <input
                                type="text"
                                placeholder="Ref code"
                                value={formData.invoice_no}
                                onChange={(e) => setFormData({ ...formData, invoice_no: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="input-group" style={{ marginTop: '0.5rem' }}>
                        <label>Remarks</label>
                        <textarea
                            style={{ width: '100%', padding: '0.875rem', borderRadius: '12px', border: '1px solid var(--border-subtle)', background: 'rgba(255,255,255,0.5)', minHeight: '80px' }}
                            placeholder="Optional notes..."
                            value={formData.remarks}
                            onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                        ></textarea>
                    </div>

                    <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                        <button type="button" onClick={onClose} className="btn btn-outline" style={{ flex: 1 }}>Cancel</button>
                        <button type="submit" disabled={loading} className="btn btn-primary" style={{ flex: 2, gap: '0.75rem' }}>
                            <Save size={18} />
                            {loading ? 'Recording...' : 'Complete Stock Entry'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddStockModal;
