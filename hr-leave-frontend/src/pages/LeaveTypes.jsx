import React, { useEffect, useState } from 'react'
// import api from '../api/axios';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';
import { X } from 'lucide-react';
import api from '../api/axios';
import { Edit, Trash2 } from 'lucide-react';
import DataTable from '../components/Datatable';
    
const LeaveTypes = () => {
    const [creating, setCreating] = useState(true);
    const [open, setOpen] = React.useState(false);
    const [leaveTypes, setLeaveTypes] = useState([]);
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        default_days: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const columns = [
        { key: 'name', header: 'Leave Type' },
        { 
            key: 'default_days', 
            header: 'Default Days',
            render: (value) => `${value} days`
        }
    ];
    const handleOpen = () => {
        setCreating(true);
        setOpen(true);
        // Reset form when opening modal
        setFormData({ name: '', default_days: '' });
        setError('');
    };
    
    const handleClose = () => {
        setOpen(false);
        setFormData({id:'', name: '', default_days: '' });
        setError('');
    };
    const handleEdit = async (leaveType) => {
        setCreating(false);
        setOpen(true);
        // Reset form when opening modal
        setFormData({ id:leaveType.id, name: leaveType.name, default_days: leaveType.default_days });
        setError('');    
    }
    const handleDelete = async (id) =>{
    try{
		const res = await api.delete('/leave-type/'+id);
		setLeaveTypes(prev => prev.filter(p => p.id !== id));
        console.log(res.data.message);
    }catch(error){
        console.error('Error deleting leave type:', error);
    }
    }
    // Fetch leave types on component mount
    useEffect(() => {
        const fetchLeaveTypes = async () => {
            try {
                const res = await api.get('/leave-types');
                if (res && res.data) {
                    setLeaveTypes(res.data);
                }
                console.log('leaveTypes', res.data);
            } catch (error) {
                console.log('error: ', error);
            }
        };
        
        fetchLeaveTypes();
    }, []);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        // Clear error when user starts typing
        if (error) setError('');
    };

    const validateForm = () => {
        if (!formData.name.trim()) {
            setError('Leave type name is required');
            return false;
        }
        if (!formData.default_days || formData.default_days <= 0) {
            setError('Default days must be greater than 0');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        setIsLoading(true);
        setError('');
        try {
        if(creating){
            const response = await api.post('/leave-types', {
                name: formData.name.trim(),
                default_days: parseInt(formData.default_days)
            });
            if (response && response.data) {
                // Add new leave type to the list
                setLeaveTypes(prev => [...prev, response.data]);
                handleClose();
                console.log('Leave type created successfully');
            }
        }   
		else{
			const res = await api.put('/leave-types/'+formData.id,{
                name: formData.name.trim(),
                default_days: parseInt(formData.default_days)
                });
                console.log('res: ',res);
                console.log('res data: ',res.data);
            if (res && res.data) {
                setLeaveTypes(prev => [...prev].map(p => 
                    p.id === res.data.id
                    ? { ...p, name: res.data.name, default_days: res.data.default_days }
                    : p
                    ));
                handleClose();
                console.log('Leave type updated successfully');
            }
            else{
                console.log('error occured');
            }
        }
        } catch (error) {
            console.error('Error creating leave type:', error);
            setError('Failed to create leave type');
        } finally {
            setIsLoading(false);
            setCreating(true);
        }
    };

    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 450,
        bgcolor: 'background.paper',
        borderRadius: '12px',
        boxShadow: 24,
        p: 4,
    };

    return (
        <>
            <div className="flex justify-between items-center mb-6">
                <Typography variant="h4" component="h1" className="font-semibold">
                    Leave Types
                </Typography>
                <button 
                    className='bg-blue-500 hover:bg-blue-400 p-2 m-2 cursor-pointer absolute right-3 text-white rounded-lg' 
                    onClick={handleOpen}
                >
                    Create leave type
                </button>
                
                <Modal
                    open={open}
                    onClose={(event, reason) => {
                        if (reason === 'backdropClick' || reason === 'escapeKeyDown') return;
                        handleClose();
                    }}
                    disableEscapeKeyDown
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                >
                    <Box sx={style}>
                        {/* Close button */}
                        <div className="flex justify-between items-center mb-4">
                            <Typography id="modal-modal-title" variant="h6" component="h2" className="font-semibold">
                              {creating?  <span>Create New Leave Type</span> : <span>Update Leave Type</span> }
                            </Typography>
                            <button 
                                onClick={handleClose} 
                                aria-label="Close"
                                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Error message */}
                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        )}

                        {/* Form fields */}
                        <div className="flex flex-col gap-3">
                            <TextField
                                fullWidth
                                label="Leave Type Name"
                                variant="outlined"
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                placeholder="e.g., Annual Leave, Sick Leave"
                                required
                                disabled={isLoading}
                            />
                            
                            <TextField
                                fullWidth
                                label="Default Days"
                                variant="outlined"
                                type="number"
                                value={formData.default_days}
                                onChange={(e) => handleInputChange('default_days', e.target.value)}
                                placeholder="e.g., 21"
                                inputProps={{ min: 1, max: 365 }}
                                required
                                disabled={isLoading}
                            />

                            {/* Form buttons */}
                            <div className="flex gap-2 pt-4">
                                <Button
                                    variant="outlined"
                                    onClick={handleClose}
                                    disabled={isLoading}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={handleSubmit}
                                    disabled={isLoading}
                                    className="flex-1"
                                >
                                    {creating? isLoading ? 'Creating...' : 'Create' :  isLoading ? 'Updating...': 'Update'}
                                </Button>
                            </div>
                        </div>
                    </Box>
                </Modal>
            </div>

{leaveTypes.length > 0 ? (
    <DataTable 
    data={leaveTypes}
    columns={columns}
    onEdit={handleEdit}
    onDelete={handleDelete}
/>
   ) : (
    <p className="text-gray-500 italic">There are no leave types yet</p>
)}
        </>
    )
}

export default LeaveTypes