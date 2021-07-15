<script>
  import { fly } from 'svelte/transition';
  import Collision from './Collision.js';
  import Note from './Note.svelte';

  export let notes;

  let transform = [];
  let collisions = [];
  let collisionTransform = [];
  let elements = [];

  $: [...notes.entries()].reverse().slice(0, 7).forEach(([i, note]) => {
    const p = i - 1;
    if (elements[i] && elements[p]) {
      const collisionDistance = -(elements[i].offsetHeight / 2 + elements[p].offsetHeight / 2);

      collisions[p] = collisions[p] || Collision.vertical({ minFriction: 0.1, maxFriction: 0.2 });
      const { rotation, slideY, slideX } = collisions[p]
        .apply(1, collisionDistance)
        .merge(...collisions.slice(i));
      collisionTransform[p] = `translate(${slideX}px, ${slideY}px) rotate(${rotation}deg)`;
    }

    transform[i] = `translateX(50vw) translateY(100vh) translateX(-50%) translateY(-50vh) translateY(-50%) ${collisionTransform[i] || ''}`;
  });

  $: {
    transform = transform.slice(0, notes.length);
    collisions = collisions.slice(0, notes.length);
    collisionTransform = collisionTransform.slice(0, notes.length - 1);
    elements = elements.slice(0, notes.length);
  }
</script>

{#each notes as note, i (note)}
  <div
    class='transform'
    bind:this={elements[i]}
    in:fly={{ duration: 200, y: 300 }}
    out:fly={{ duration: 200, y: 50 }}
    style='transform: {transform[i] || 'none'}'>
    <Note {note} on:focus on:navigate />
  </div>
{/each}

<style>
  .transform {
    position: absolute;
    top: 0;
    left: 0;
    transform-origin: bottom-center;
    transition: transform 0.2s;
  }
</style>
