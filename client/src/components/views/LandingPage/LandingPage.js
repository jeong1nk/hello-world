import React, { useEffect } from 'react'
import axios from 'axios';

function LandingPage() {

  useEffect(() => {
    console.log('🟢 useEffect 실행됨');
    axios.get('http://localhost:5000/api/hello')
      .then(response => {
        console.log('✅ 응답:', response.data);
      })
      .catch(error => {
        console.error('❌ 에러 발생:', error);
      });
  }, []);


  return (
    <div>
      LandingPage 랜딩페이지
    </div>
  )
}

export default LandingPage;
