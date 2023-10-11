import React from 'react';


export default function FriendsComponent() {
  const { friends } = usePluginData('landing-page')
  return <div>Your friends are {friends.join(',')}</div>;
}