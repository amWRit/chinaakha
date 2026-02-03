import { prisma } from '@/lib/prisma';

export default async function PoemsImagesPage() {
  const poems = await prisma.poem.findMany({
    where: { 
      type: 'IMAGE',
      status: 'PUBLISHED'
    },
    orderBy: { order: 'asc' },
    include: { image: true },
  });

  return (
    <main className="container">
      <div id="logo">
        <img src="/images/logos/logo_final.png" alt="Chinaakha Logo" style={{ marginTop: 25, display: 'block', marginLeft: 'auto', marginRight: 'auto' }} />
      </div>
      <div>
        {poems.map((poem) => (
          <blockquote className="blockquote" key={poem.id}>
            <img src={`https://drive.google.com/uc?export=view&id=${poem.image?.fileId}`} alt="Poem Image" style={{ maxWidth: '100%' }} />
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
