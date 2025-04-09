import Profile from '../../components/Profile';

const StudentProfile = () => {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600">View and edit your profile information</p>
      </div>
      
      <Profile />
    </div>
  );
};

export default StudentProfile;
