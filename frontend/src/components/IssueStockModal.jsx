import React, { useState, useEffect } from 'react';
import { X, Send, Database } from 'lucide-react';
import { getAllMedicines, getMedicineBatches, addStockOut } from '../services/api';
import toast from 'react-hot-toast';

const IssueStockModal = ({ isOpen, onClose, onRefresh }) => {
    const [medicines, setMedicines] = useState([]);
    const [batches, setBatches] = useState([]);
    const [formData, setFormData] = useState({
        medicine_id: '',
        batch_id: '',
        quantity: '',
        purpose: 'Patient Distribution',
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
            setMedicines([
                { medicine_id: 1, name: 'Paracetamol 500mg' },
                { medicine_id: 2, name: 'Amoxicillin 250mg' },
                { medicine_id: 3, name: 'Cetirizine' }
            ]);
        }
    };

    const handleMedicineChange = async (id) => {
        setFormData({ ...formData, medicine_id: id, batch_id: '' });
        if (!id) {
            setBatches([]);
            return;
        }

        try {
            const data = await getMedicineBatches(id);
            setBatches(Array.isArray(data) ? data : []);
        } catch (err) {
            // Mock fallback
            setBatches([
                { id: 101, batch_number: 'BATCH-A1', expiry_date: '2026-10-20', quantity_remaining: 450 },
                { id: 102, batch_number: 'BATCH-B4', expiry_date: '2027-01-15', quantity_remaining: 120 }
            ]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.medicine_id || !formData.batch_id || !formData.quantity) {
            return toast.error('Please fill required fields');
        }

        const selectedBatch = batches.find(b => b.id.toString() === formData.batch_id.toString());
        if (selectedBatch && Number(formData.quantity) > selectedBatch.quantity_remaining) {
            return toast.error(`Only ${selectedBatch.quantity_remaining} available in this batch`);
        }

        setLoading(true);
        try {
            await addStockOut({
                batch_id: formData.batch_id,
                quantity: Number(formData.quantity),
                remarks: formData.remarks
            });
            toast.success('Stock issued successfully');
            onRefresh();
            onClose();
        } catch (err) {
            console.error('Issue Stock Error:', err);
            const msg = err.response?.data?.message || 'Failed to issue stock';
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
                width: '100%', maxWidth: '500px', padding: '2.5rem',
                margin: 'auto', transform: 'none',
                background: 'white', borderRadius: '20px',
                boxShadow: '0 25px 60px rgba(0,0,0,0.15)',
                maxHeight: '90vh', overflowY: 'auto'
            }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Stock Issuance / Dispatch</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                        <X size={24} />
                    </button>
                </header>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Select Medicine</label>
                        <select
                            value={formData.medicine_id}
                            onChange={(e) => handleMedicineChange(e.target.value)}
                            required
                        >
                            <option value="">Select Medicine</option>
                            {medicines.map(m => (
                                <option key={m.medicine_id} value={m.medicine_id}>{m.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="input-group">
                        <label>Available Batch (FIFO priority)</label>
                        <select
                            value={formData.batch_id}
                            onChange={(e) => setFormData({ ...formData, batch_id: e.target.value })}
                            required
                            disabled={!formData.medicine_id}
                        >
                            <option value="">Select Batch</option>
                            {batches.map(b => (
                                <option key={b.id} value={b.id}>
                                    {b.batch_number} (Exp: {b.expiry_date}) - {b.quantity_remaining} available
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div className="input-group">
                            <label>Issue Quantity</label>
                            <input
                                type="number"
                                placeholder="Qty to deduct"
                                value={formData.quantity}
                                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                required
                                min="1"
                            />
                        </div>
                        <div className="input-group">
                            <label>Issue Basis</label>
                            <select
                                value={formData.purpose}
                                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                            >
                                <option value="Patient Distribution">Patient Distribution</option>
                                <option value="Transfer">Transfer to Center</option>
                                <option value="Disposal">Expired Disposal</option>
                                <option value="Damaged">Damaged</option>
                            </select>
                        </div>
                    </div>

                    <div className="input-group">
                        <label>Remarks</label>
                        <textarea
                            style={{ width: '100%', padding: '0.875rem', borderRadius: '12px', border: '1px solid var(--border-subtle)', background: 'rgba(255,255,255,0.5)', minHeight: '80px' }}
                            placeholder="Patient name or reference..."
                            value={formData.remarks}
                            onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                        ></textarea>
                    </div>

                    <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                        <button type="button" onClick={onClose} className="btn btn-outline" style={{ flex: 1 }}>Cancel</button>
                        <button type="submit" disabled={loading} className="btn btn-primary" style={{ flex: 2, gap: '0.75rem', background: 'var(--critical)' }}>
                            <Send size={18} />
                            {loading ? 'Processing...' : 'Issue Stock Units'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default IssueStockModal;
