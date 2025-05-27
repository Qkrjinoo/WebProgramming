export const config = {
  runtime: 'edge'
};

export default (request) => {
  const now = new Date().toISOString();
  return new Response(
    JSON.stringify({ now }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};
