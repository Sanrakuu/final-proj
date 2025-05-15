import db from '../providers/firebase.js';

// label -  egg
// status-  set | incubating | hatched
const makeEgg = async (req, res) => {
  const { label } = req.body;

  if (!label) {
    return res.status(400).json({ error: 'Label is required' });
  }

  try {
    const eggRef = await db.collection('eggs').add({
      label,
      status: "set",
      createdAt: new Date(),
    });

    res.status(201).json({ id: eggRef.id, label, status: 'set' });
  } catch (error) {
    console.error('Error creating egg:', error);
    res.status(500).json({ error: 'Failed to create egg' });
  }
}

const updateEggStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  try {
    const eggRef = db.collection('eggs').doc(id);
    await eggRef.update({ status });
    res.status(200).json({ id, status });
  } catch (error) {
    console.error('Error updating egg:', error);
    res.status(500).json({ error: 'Failed to update egg' });
  }
}

const deleteEgg = async (req, res) => {
  const { id } = req.params;

  try {
    const eggRef = db.collection('eggs').doc(id);
    await eggRef.delete();
    res.status(200).json({ message: 'egg deleted successfully' });
  } catch (error) {
    console.error('Error deleting egg:', error);
    res.status(500).json({ error: 'Failed to delete egg' });
  }
}

const getEggs = async (req, res) => {
  try {
    const snapshot = await db.collection('eggs').get();
    const eggs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(eggs);
  } catch (error) {
    console.error('Error fetching eggs:', error);
    res.status(500).json({ error: 'Failed to fetch eggs' });
  }
}

export { makeEgg, updateEggStatus, deleteEgg, getEggs };