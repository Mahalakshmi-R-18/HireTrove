import React, { useEffect, useState } from 'react';
import { getAuth, updateProfile } from 'firebase/auth';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { TextField, FormControl, FormGroup, FormControlLabel, Checkbox, Typography, Container } from '@mui/material';

const MemberUpdateSkills = () => {
    const auth = getAuth();
    const db = getFirestore();
    const [userData, setUserData] = useState({
        name: '',
        phone: '',
        skills: []
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const skillsOptions = ["Drawing", "Painting", "Content Writing", "Video Editing", "Photography", "Art and Craft", "Poster Making"];

    useEffect(() => {
        const fetchUserData = async () => {
            const user = auth.currentUser;
            if (user) {
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                if (userDoc.exists()) {
                    const data = userDoc.data();
                    setUserData({
                        name: data.name || '',
                        phone: data.phone || '',
                        skills: data.skills || []
                    });
                }
            }
            setLoading(false);
        };
        fetchUserData();
    }, [auth, db]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUserData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSkillsChange = (e) => {
        const { value, checked } = e.target;
        setUserData((prevData) => ({
            ...prevData,
            skills: checked ? [...prevData.skills, value] : prevData.skills.filter(skill => skill !== value)
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        const user = auth.currentUser;
        if (user) {
            try {
                // Update user profile (name, phone)
                await updateProfile(user, { displayName: userData.name });
                
                // Update Firestore user document (name, phone, skills)
                await updateDoc(doc(db, 'users', user.uid), {
                    name: userData.name,
                    phone: userData.phone,
                    skills: userData.skills
                });

                await updateDoc(doc(db, 'member', user.uid), {
                    name: userData.name,
                    phone: userData.phone,
                    skills: userData.skills
                });

                alert('Profile updated successfully');
            } catch (error) {
                console.error('Error updating profile: ', error);
                alert('Failed to update profile');
            }
        }
        setSaving(false);
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    return (
        <Container maxWidth="sm" sx={{ marginTop: '30px', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '12px', boxShadow: 3 }}>
            <Typography variant="h4" align="center" gutterBottom>
                Update Your Skills
            </Typography>
            <form>
                <TextField
                    label="Name"
                    name="name"
                    value={userData.name}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                    disabled={saving}
                />
                <TextField
                    label="Phone Number"
                    name="phone"
                    value={userData.phone}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                    disabled={saving}
                />
                <FormControl component="fieldset" margin="normal">
                    <Typography variant="h6" sx={{ marginBottom: '10px' }}>Skills Selected :</Typography>
                    <FormGroup>
                        {skillsOptions.map((skill) => (
                            <FormControlLabel
                                key={skill}
                                control={
                                    <Checkbox
                                        value={skill}
                                        checked={userData.skills.includes(skill)}
                                        onChange={handleSkillsChange}
                                        disabled={saving}
                                        sx={{
                                            '&.Mui-checked': {
                                                color: '#831843' // bg-fuchsia-900 equivalent
                                            }
                                        }}
                                    />
                                }
                                label={skill}
                            />
                        ))}
                    </FormGroup>
                </FormControl>
            </form>
            <button
                type="button"
                onClick={handleSave}
                className={`bg-fuchsia-900 hover:bg-fuchsia-700 text-white py-2 px-4 rounded-lg w-full mt-4 ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={saving}
            >
                Save Changes
            </button>
        </Container>
    );
};

export default MemberUpdateSkills;
