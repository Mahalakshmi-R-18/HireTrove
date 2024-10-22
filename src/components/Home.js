import React from 'react';
import { Link } from 'react-router-dom';
import About from './About';
import Header from './Header';
import ImageSlider from '../components/ImageSlider'; // Adjust the path based on your file structure

const Home = () => {
  return (
    <div>
      <Header />
      <div id="home" className="bg-home-bg bg-fixed bg-cover w-full h-fit flex flex-col min-h-screen">
        {/* Home Section */}
        <div className="flex-grow flex items-center justify-center mt-20">
          <div className="p-6 bg-fuchsia-200 bg-opacity-40 rounded-lg shadow-lg max-w-6xl w-full mx-4 text-center">
            <h1 className="text-4xl font-bold mb-4">Welcome to HireTrove</h1>
            <p className="text-lg mb-4">
              Your one-stop solution for skill sharing and recruitment.<br />
              Explore a variety of opportunities to connect with skilled professionals and find the perfect match for your needs.
            </p>
            <p className="text-lg mb-4">
              Whether you're looking to share your skills, discover new talents, or recruit the best candidates,<br /> HireTrove provides a seamless platform to achieve your goals.
              Join our community today and start your journey with us!
            </p>
            <div className="flex justify-center space-x-4">
              <Link
                to="/signup"
                className="bg-fuchsia-900 text-white py-2 px-4 rounded hover:bg-fuchsia-800 transition-colors"
              >
                Register Here
              </Link>
              <Link
                to="/login"
                className="bg-fuchsia-900 text-white py-2 px-4 rounded hover:bg-fuchsia-800 transition-colors"
              >
                Login Here
              </Link>
            </div>
          </div>
        </div>

        <br />
        <br />

        <ImageSlider />

        <About />
      </div>
    </div>
  );
};

export default Home;
