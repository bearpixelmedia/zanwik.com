import React from 'react';
import { FC } from 'react';

interface UserProfileProps {
  // Add your props here
}

const UserProfile: FC<UserProfileProps> = ({}) => {
  return (
    <div className="userprofile-container">
      <h2>UserProfile</h2>
    </div>
  );
};

export default UserProfile;