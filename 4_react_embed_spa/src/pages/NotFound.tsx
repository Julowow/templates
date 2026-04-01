const NotFound = () => {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      fontFamily: "system-ui, sans-serif",
      color: "#666",
    }}>
      <div style={{ textAlign: "center" }}>
        <h1 style={{ fontSize: "48px", marginBottom: "8px" }}>404</h1>
        <p>Page not found</p>
      </div>
    </div>
  );
};

export default NotFound;
