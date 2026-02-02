import { prisma } from '@/lib/prisma';
// Removed invalid CSS import; global styles should be imported in _app.tsx

export default async function PoemsPage() {
  const poems = await prisma.poem.findMany({
    orderBy: { order: 'asc' },
    include: { image: true },
  });

  return (
    <main className="container">
      <div id="logo">
        <img src="/images/logo_final.png" alt="Chinaakha Logo" style={{ marginTop: 25, display: 'block', marginLeft: 'auto', marginRight: 'auto' }} />
      </div>
      <div>
        {poems.map((poem, idx) => (
          <blockquote className="blockquote" key={poem.id}>
            {poem.type === 'TEXT' ? (
              <h1>{poem.content}</h1>
            ) : (
              <img src={`https://drive.google.com/uc?export=view&id=${poem.image?.fileId}`} alt="Poem Image" style={{ maxWidth: '100%' }} />
            )}
          </blockquote>
        ))}
      </div>
      <div className="text">- RANDOM FEELINGS PUT INTO WORDS -</div>
      <div style={{ textAlign: 'center', marginTop: 20 }}>
        <span style={{ fontSize: 32, color: '#e46c6e' }}>💖</span>
        <a href="https://instagram.com/chinaakha" target="_blank" rel="noopener noreferrer" style={{ marginLeft: 10 }}>
          <i className="fa fa-instagram" />
        </a>
      </div>
    </main>
  );
}
