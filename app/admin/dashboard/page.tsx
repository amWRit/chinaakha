import { PrismaClient } from '@prisma/client';

export default async function AdminDashboardPage() {
  const prisma = new PrismaClient();
  const poems = await prisma.poem.findMany({ orderBy: { order: 'asc' }, include: { image: true } });
  const admins = await prisma.admin.findMany();
  await prisma.$disconnect();

  return (
    <main className="container">
      <h1>CHINAAKHA ADMIN ✨</h1>
      <div style={{ marginBottom: 24 }}>
        <button>POEMS</button>
        <button>SETTINGS</button>
      </div>
      <section>
        <h2>Poems</h2>
        <ul>
          {poems.map(poem => (
            <li key={poem.id}>
              {poem.type === 'TEXT' ? poem.content : <img src={`https://drive.google.com/uc?export=view&id=${poem.image?.fileId}`} alt="Poem Image" style={{ maxWidth: '100px' }} />} 
              <button>Delete</button>
            </li>
          ))}
        </ul>
        <h3>Add Text Poem</h3>
        <textarea placeholder="Enter Nepali poem text" />
        <button>Add Text Poem</button>
        <h3>Add Image Poem</h3>
        <input placeholder="Paste Google Drive FileId" />
        <button>Add Image Poem</button>
      </section>
      <section>
        <h2>Settings</h2>
        <ul>
          {admins.map(admin => (
            <li key={admin.id}>{admin.email} <button>Delete</button></li>
          ))}
        </ul>
        <h3>Add Admin</h3>
        <input placeholder="Email" />
        <input placeholder="Password" type="password" />
        <button>Add Admin</button>
      </section>
    </main>
  );
}
