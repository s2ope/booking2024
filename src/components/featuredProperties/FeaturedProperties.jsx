import useFetch from "../../hooks/useFetch";
import "./featuredProperties.css";

const FeaturedProperties = () => {
  const { data, loading, error } = useFetch(
    "http://localhost:8800/api/hotels?featured=true&limit=4"
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading featured properties</div>;

  return (
    <div className="fp">
      {data.map((item) => (
        <div className="fpItem" key={item._id}>
          <img
            src={item.photos?.[0] || "default-image-url.jpg"}
            alt={`${item.name}`}
            className="fpImg"
          />
          <span className="fpName">{item.name}</span>
          <span className="fpCity">{item.city}</span>
          <span className="fpPrice">
            Starting from <b>${item.cheapestPrice}</b>
          </span>
          {item.rating && (
            <div className="fpRating">
              <button>{item.rating}</button>
              <span>Excellent</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default FeaturedProperties;
