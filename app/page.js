'use client'
import Image from "next/image";
import {useState,useEffect,useRef} from'react'
import{firestore} from '@/firebase'
import { Stack,Box, Button, Modal, TextField, Typography,AppBar,Toolbar
  ,InputBase
 } from "@mui/material"
import { collection,getDocs,query,getDoc,setDoc,doc,deleteDoc } from "firebase/firestore"
import {Camera} from 'react-camera-pro'
import { getStorage,ref, uploadString, getDownloadURL } from "firebase/storage"
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import { alpha, styled,createTheme,ThemeProvider } from '@mui/material/styles';
import OpenAI from "openai"
import dotenv from 'dotenv'

dotenv.config()

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(1),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

const theme=createTheme({
  palette:{
    primary:{
      main:"#DC5F00",
    },
    secondary: {
      main: "#373A40",
    },
  }
})
const PrimaryColorTypography = styled(Typography)(({ theme }) => ({
  color: theme.palette.primary.main,
}));

const fetchAndShowRecipe = async () => {
  const ingredients = inventory.map(item => item.name).join(', ');

  try {
    const completion = await openai.chat.completions.create({
      model: "meta-llama/llama-3.1-8b-instruct:free",
      messages: [
        { role: "user", content: `Generate a recipe using the following ingredients: ${ingredients}` }
      ],
    });

    setRecipe(completion.choices[0].message.content);
    setRecipeOpen(true);
  } catch (error) {
    console.error("Error fetching recipe:", error);
  }
};

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [imageData, setImageData] = useState(null);
  const cameraRef = useRef(null);
  const storage = getStorage();
  const [searchQuery, setSearchQuery] = useState('');
  const [recipe, setRecipe] = useState('');
  const [recipeOpen, setRecipeOpen] = useState(false);

  const updateInventory= async()=> {
    const snapshot= query(collection(firestore,'inventory'))
    const docs= await getDocs(snapshot)
    const inventoryList=[]
    docs.forEach((doc) => {
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      })
    })
    setInventory(inventoryList)
  }
  const addItem = async (item, image) => {
    // const storageRef = ref(storage, `inventory/${item}.jpg`);
    // await uploadString(storageRef, image, 'data_url');
    // const downloadURL = await getDownloadURL(storageRef);

    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + 1 });
    } else {
      await setDoc(docRef, { quantity: 1});
    }
    await updateInventory();
  };

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore,'inventory'),item)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()){
      const {quantity} = docSnap.data()
      if (quantity===1) {
        await deleteDoc(docRef)
      } else {
        await setDoc(docRef, {quantity: quantity-1})
      }
      }

      await updateInventory()
    }
  

  useEffect(()=> {
    updateInventory()
  },[])

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)
  const handleCameraOpen = () => setCameraOpen(true)
  const handleCameraClose = () => setCameraOpen(false)

  const handleCapture = () => {
    const image = cameraRef.current.takePhoto();
    setImageData(image);
    handleCameraClose();
  };

  const filteredInventory = inventory.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  return (
  <ThemeProvider theme={theme}>
   <Box>
    <AppBar position="fixed"  sx={{ bgcolor: '#373A40' }}>
        <Toolbar >
          {/* <Typography variant="h4" noWrap component="div" sx={{ flexGrow: 1 }}>
            Cooks Cabinet
          </Typography> */}
          <Typography variant="h4" noWrap component="div" sx={{ flexGrow: 1 }}>
          Cooks <PrimaryColorTypography variant="h4" component="span">Cabinet</PrimaryColorTypography>
        </Typography>
          <Search>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search…"
              inputProps={{ 'aria-label': 'search' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Search>
        </Toolbar>
    </AppBar>
    <Box 
    width="100vw" 
    height="100vh" 
    display="flex"
    flexDirection="column"
    justifyContent="center"
    alignItems="center"
    gap={2}
    paddingTop={2}
    bgcolor="#EEEEEE">
    
    <Modal
      open ={open}
      onClose={handleClose}>
        <Box
          position="absolute" top="50%" left= "50%"
          sx={{transform:"translate(-50%,-50%)"}}
          width={500}
          bgcolor="white" 
          border= "2px solid #000"
          boxshadow={24}
          p={4}
          display="flex"
          flexdirection="column"
          gap={3}>
            <Typography variant="h6"> Add item</Typography>
            <Stack width="100" direction="row" spacing={2}>
              <TextField 
              variant='outlined'
              fullwidth
              value= {itemName}
              onChange={(e)=> {
                setItemName(e.target.value)
              }}/>
              <Button
              variant ="outlined"
              onClick={()=>{
                addItem(itemName)
                setItemName('')
                handleClose()
              }}>Add</Button>
              
            </Stack>
        </Box>

    </Modal>
    <Modal
        open={cameraOpen}
        onClose={handleCameraClose}>
        <Box
          position="absolute" top="50%" left="50%"
          sx={{ transform: "translate(-50%,-50%)" }}
          width={400}
          height={400}
          bgcolor="white" 
          border="2px solid #000"
          boxShadow={24}
          p={5}
          
          display="flex"
          flexDirection="column"
          gap={3}>
          <Box position= "relative" width="100%" 
          height="250px" display="flex"
           justifyContent="center" bgcolor= "F8EDED">
          <Camera ref={cameraRef} />
          </Box>
          
          <Button variant="contained" onClick={handleCapture}>Capture</Button>
        </Box>
      </Modal>
      <Modal
            open={recipeOpen}
            onClose={() => setRecipeOpen(false)}
          >
            <Box
            position="absolute" top="50%" left="50%"
            sx={{ transform: "translate(-50%,-50%)" }}
            width={600}
            bgcolor="white"
            border="2px solid #000"
            boxShadow={24}
            p={4}
            display="flex"
            flexDirection="column"
            gap={3}
          >
            <Typography variant="h6">Generated Recipe</Typography>
            <Typography>{recipe}</Typography>
            <Button
              variant="contained"
              onClick={() => setRecipeOpen(false)}
            >
              Close
            </Button>
          </Box>
        </Modal>

    <Box width="100%" alignItems="center" justifyContent="center" gap={3} padding={2}
      display="flex">
    <Button variant="contained"
    onClick={()=> {
      handleOpen()
    }}
   >Add new item
    </Button> 
    <Button variant="contained" onClick={handleCameraOpen}>Add using camera</Button>

    </Box>
    <Box border="1px solid #333">
        <Box 
          width="1000px"
          display="flex"
          height="70px"
          alignItems="center"
          justifyContent="center"
          bgcolor="#373A40">
          <Typography variant="h4" color="white"> Cabinet Items </Typography>
        </Box>

        <Stack width="100%" height="300px" spacing={2} overflow="auto" p={2}>
              {filteredInventory.map(({ name, quantity, image }) => (
                <Box key={name} width="100%"
                  minHeight="100px"
                  display="flex"
                  alignItems="center"
                  justifyContent='space-between'
                  bgcolor="#f0f0f0"
                  padding={5}
                  border='1px solid #DC5F00'
                  borderRadius={2}>
                  <Typography variant="h4" color="#333" textAlign="center">
                    {name.charAt(0).toUpperCase() + name.slice(1)}
                  </Typography>
                 
                  {image && <img src={image} alt={name} width={50} />}
                  <Box display='flex' gap={1} alignItems='center'>
                  <Button variant="contained" color="primary" onClick={() => addItem(name)}><AddIcon/></Button>
                  <Button variant="contained" color="primary" onClick={() => removeItem(name)}><RemoveIcon/></Button>
                  </Box>
                  <Typography variant="h3" color="#333" textAlign="center">
                    {quantity}
                  </Typography>
            </Box>
          ))}
        </Stack>
      </Box>
      <Button
              variant="contained"
              onClick={fetchAndShowRecipe}
            >
              Generate Recipe
            </Button>
    </Box>
    </Box>
    </ThemeProvider>
  )
}