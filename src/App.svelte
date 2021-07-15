<script>
  import { onMount } from 'svelte';
  import Paper from 'scattered-papers/Paper.svelte';
  import Content from 'scattered-papers/Content.svelte';
  import Stack from './Stack.svelte';

  let notes = [];

  const getNote = async (name) => {
    const res = await fetch(`/note/${name}`);
    return res.text();
  };

  const addNote = (name) => (content) => {
    notes = [...notes, { name, content }];
  };

  const navigate = (name) => getNote(name).then(addNote(name));
  const focus = (note) => { notes = notes.slice(0, notes.indexOf(note) + 1); };

  onMount(() => { navigate('__index.md'); });
  const detail = (f) => ({ detail }) => f(detail);
</script>

<Stack {notes} on:focus={detail(focus)} on:navigate={detail(navigate)} />
