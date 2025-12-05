const supabase = require('../config/supabase');

// POST /lost
const createLostItem = async (req, res) => {
  try {
    const { formData } = req.body;
    
    if (!formData.ownerName || !formData.itemName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const itemDate = new Date(formData.date);
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const isOldItem = itemDate <= oneYearAgo;

    const finalLocation = (formData.location === 'Room' || formData.location === 'Others') && formData.specificLocation
        ? `${formData.location}: ${formData.specificLocation}`
        : formData.location;
    
    const finalCategory = formData.category === 'Others' && formData.specificCategory
        ? `Others: ${formData.specificCategory}`
        : formData.category;

    let error;

    if (isOldItem) {
      const result = await supabase.from('archives').insert([{
        name: formData.itemName,
        category: finalCategory,
        floor: formData.floor,
        location: finalLocation,
        item_date: formData.date,
        item_time: formData.time,
        description: formData.description,
        contact_number: formData.contactNumber,
        contact_email: formData.contactEmail,
        person_name: formData.ownerName,
        occupation: formData.occupancy,
        archive_reason: 'unsolved', // Items from Lost form go to Unsolved
        original_table: 'lost_items',
        status: 'archived'
      }]);
      error = result.error;
    } else {
      const result = await supabase.from('lost_items').insert([{
        owner_name: formData.ownerName,
        name: formData.itemName,
        occupation: formData.occupancy,
        category: finalCategory,
        floor: formData.floor,
        location: finalLocation,
        lost_date: formData.date,
        lost_time: formData.time,
        description: formData.description,
        contact_number: formData.contactNumber,
        contact_email: formData.contactEmail,
        status: 'pending'
      }]);
      error = result.error;
    }

    if (error) throw error;
    res.status(201).json({ message: isOldItem ? 'Item archived' : 'Reported successfully' });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /lost
const getAllLostItems = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('lost_items')
      .select('*')
      .eq('status', 'pending')
      .order('lost_date', { ascending: false });

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE /lost/:id
const deleteLostItem = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 1. Perform Delete AND Select the deleted record
    const { data, error } = await supabase
      .from('lost_items')
      .delete()
      .eq('id', id)
      .select(); // <--- CRITICAL: This returns the deleted row(s)

    if (error) throw error;

    // 2. Check if anything was actually deleted
    if (!data || data.length === 0) {
      return res.status(404).json({ error: "Item not found or already deleted" });
    }

    res.status(200).json({ message: 'Deleted successfully', deletedItem: data[0] });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createLostItem, getAllLostItems, deleteLostItem };