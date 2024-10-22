import React from 'react';

const About = () => {
  return (
    <div id="about" className="flex items-center justify-center min-h-screen ">
      <div className="text-center p-8 bg-white bg-opacity-70 rounded-lg shadow-2xl max-w-4xl w-full mx-4">
        <h1 className="text-5xl font-extrabold mb-6 text-fuchsia-900">About HireTrove</h1>
        <p className="text-xl mb-6 text-gray-800 leading-relaxed">
          HireTrove is a vibrant platform that connects members, recruiters, and admins for skill sharing and hiring opportunities.
          Our mission is to empower individuals with the right skills and help recruiters find the best talent. At HireTrove, we
          celebrate creativity and innovation through various skill sets, including:
        </p>
        <ul className="list-disc list-inside text-lg mb-6 text-gray-800 leading-relaxed ml-10 text-left">
          <li><strong>Drawing:</strong> Explore the world of visual arts, from sketching to detailed illustrations.</li>
          <li><strong>Painting:</strong> Express your creativity through vibrant colors and unique painting techniques.</li>
          <li><strong>Content Writing:</strong> Craft compelling narratives, engaging articles, and creative copy.</li>
          <li><strong>Video Editing:</strong> Bring stories to life with professional video editing skills.</li>
          <li><strong>Photography:</strong> Capture moments and tell stories through the lens of a camera.</li>
          <li><strong>Art and Craft:</strong> Create beautiful handmade crafts and artistic pieces.</li>
          <li><strong>Poster Making:</strong> Design eye-catching posters for various purposes and events.</li>
        </ul>
        <p className="text-xl mb-6 text-gray-800 leading-relaxed">
          Join our community today and take the first step towards achieving your creative aspirations with HireTrove.
        </p>
        <p className="text-xl mb-6 text-gray-800 leading-relaxed">
          Whether you're looking to share your skills, discover new talents, or recruit the best candidates, HireTrove provides a
          seamless platform to achieve your goals. Together, we can build a thriving community of skilled professionals and
          passionate learners.
        </p>
      </div>
    </div>
  );
};

export default About;
