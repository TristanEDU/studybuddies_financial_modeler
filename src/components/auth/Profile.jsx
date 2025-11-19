import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Icon from '../AppIcon';

const Profile = () => {
  const { user, userProfile, profileLoading } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    companyName: '',
    avatarUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setFormData({
        fullName: userProfile?.full_name || '',
        companyName: userProfile?.company_name || '',
        avatarUrl: userProfile?.avatar_url || ''
      });
    }
  }, [userProfile]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      const { data, error } = await authService?.updateProfile(formData);
      
      if (error) {
        setError(error?.message);
      } else {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <Icon name="Loader2" size={20} className="animate-spin text-primary" />
          <span className="text-muted-foreground">Loading profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-2xl">
        <div className="bg-card border border-border rounded-lg">
          <div className="p-6 border-b border-border">
            <div className="flex items-center space-x-3">
              <Icon name="User" size={24} className="text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Profile Settings</h1>
                <p className="text-muted-foreground">Manage your account information</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Account Information */}
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4">Account Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground">
                    Email address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="mt-1 bg-muted"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Email cannot be changed. Contact support if needed.
                  </p>
                </div>

                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-foreground">
                    Full name
                  </label>
                  <Input
                    id="fullName"
                    type="text"
                    value={formData?.fullName}
                    onChange={(e) => handleInputChange('fullName', e?.target?.value)}
                    placeholder="Enter your full name"
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-foreground">
                    Company name
                  </label>
                  <Input
                    id="companyName"
                    type="text"
                    value={formData?.companyName}
                    onChange={(e) => handleInputChange('companyName', e?.target?.value)}
                    placeholder="Enter your company name"
                    className="mt-1"
                  />
                </div>

                <div>
                  <label htmlFor="avatarUrl" className="block text-sm font-medium text-foreground">
                    Avatar URL
                  </label>
                  <Input
                    id="avatarUrl"
                    type="url"
                    value={formData?.avatarUrl}
                    onChange={(e) => handleInputChange('avatarUrl', e?.target?.value)}
                    placeholder="https://example.com/avatar.jpg"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Account Stats */}
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4">Account Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Icon name="Shield" size={16} className="text-primary" />
                    <span className="text-sm font-medium text-foreground">Role</span>
                  </div>
                  <p className="mt-1 text-lg font-semibold text-foreground capitalize">
                    {userProfile?.role || 'User'}
                  </p>
                </div>

                <div className="p-4 bg-success/5 border border-success/20 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Icon name="Calendar" size={16} className="text-success" />
                    <span className="text-sm font-medium text-foreground">Member since</span>
                  </div>
                  <p className="mt-1 text-lg font-semibold text-foreground">
                    {userProfile?.created_at 
                      ? new Date(userProfile.created_at)?.toLocaleDateString()
                      : 'Unknown'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
                <div className="flex">
                  <Icon name="AlertCircle" size={16} className="text-destructive mt-0.5 mr-2 flex-shrink-0" />
                  <div className="text-sm text-destructive">{error}</div>
                </div>
              </div>
            )}

            {success && (
              <div className="bg-success/10 border border-success/20 rounded-md p-3">
                <div className="flex">
                  <Icon name="CheckCircle" size={16} className="text-success mt-0.5 mr-2 flex-shrink-0" />
                  <div className="text-sm text-success">Profile updated successfully!</div>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Icon name="Save" size={16} className="mr-2" />
                    Save Changes
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => window.history?.back()}
                className="sm:w-auto"
              >
                <Icon name="ArrowLeft" size={16} className="mr-2" />
                Back
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;