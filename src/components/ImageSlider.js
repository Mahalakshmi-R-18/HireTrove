import React from 'react';
import Slider from 'react-slick';
import image1 from '../images/art_and_craft.jpg'; 
import image2 from '../images/content_writing.jpg';
import image3 from '../images/craft.jpg';
import image4 from '../images/drawing.jpg';
import image5 from '../images/painting.jpg';
import image6 from '../images/photography.jpg';
import image7 from '../images/poster.jpg';
import image8 from '../images/video_editing.jpg';
import image9 from '../images/art_and_craft1.jpg'; 

const ImageSlider = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 700,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 1500,
  };

  return (
    <div className="slider-container my-8">
      <Slider {...settings}>
        <div className="slider-item">
          <img src={image1} alt="Image 1" className="slider-image" />
        </div>
        <div className="slider-item">
          <img src={image2} alt="Image 2" className="slider-image" />
        </div>
        <div className="slider-item">
          <img src={image3} alt="Image 3" className="slider-image" />
        </div>
        <div className="slider-item">
          <img src={image4} alt="Image 4" className="slider-image" />
        </div>
        <div className="slider-item">
          <img src={image5} alt="Image 5" className="slider-image" />
        </div>
        <div className="slider-item">
          <img src={image6} alt="Image 6" className="slider-image" />
        </div>
        <div className="slider-item">
          <img src={image7} alt="Image 7" className="slider-image" />
        </div>
        <div className="slider-item">
          <img src={image9} alt="Image 9" className="slider-image" />
        </div>
        <div className="slider-item">
          <img src={image8} alt="Image 8" className="slider-image" />
        </div>
      </Slider>
    </div>
  );
};

export default ImageSlider;
