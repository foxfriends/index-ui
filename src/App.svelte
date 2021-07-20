<script>
  import { onMount } from 'svelte';
  import Paper from 'scattered-papers/Paper.svelte';
  import Content from 'scattered-papers/Content.svelte';
  import Stack from './Stack.svelte';

  let notes = [];
  const generation = Math.random();

  const getNote = async (name) => {
    const res = await fetch(`/note/${name}`);
    return res.text();
  };

  const printName = (name) => (name === '__index.md' ? '' : name.slice(0, -3));

  const addNote = (name) => (content) => {
    const id = notes.length;
    const note = { id, name, content, generation };
    notes = [...notes, note];
    if (notes.length === 1) {
      window.history.replaceState(note, name, `/${printName(name)}`);
    } else {
      window.history.pushState(note, name, `/${printName(name)}`);
    }
  };

  const navigate = (name) => getNote(name).then(addNote(name));
  const focus = (note) => {
    const index = notes.indexOf(note) + 1;
    if (index !== notes.length) {
      window.history.go(index - notes.length);
    }
  };

  const popstate = (event) => {
    if (event.state) {
      const { generation: gen, id, name, content } = event.state;
      if (gen !== generation) {
        window.location.href = `/${printName(name)}`;
        return;
      }
      const index = notes.findIndex((note) => note.id === id);
      if (index === -1) {
        notes = [...notes, { ...event.state, generation, id: notes.length }];
      } else {
        notes = notes.slice(0, index + 1);
      }
    } else {
      notes = notes.slice(0, -1);
    }
  }

  const page = (window.location.pathname.slice(1) || '__index') + '.md';
  onMount(() => { navigate(page); });
  const detail = (f) => ({ detail }) => f(detail);
</script>

<Stack {notes} on:focus={detail(focus)} on:navigate={detail(navigate)} />

<svelte:window on:popstate={popstate} />
