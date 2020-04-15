import React from 'react';
import { Link } from 'react-router-dom';

const OtherPage = () => {
  return (
    <div>
      Im Other page.
      <Link to='/'>Go to Home</Link>
    </div>
  )
}

export default OtherPage;