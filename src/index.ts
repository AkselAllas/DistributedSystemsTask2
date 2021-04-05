import main from './main';

try {
  main();
} catch (e) {
  console.error('\x1b[31m', e);
  process.exit(1);
}
