<?php

    $inData = getRequestInfo();
    
    $firstname = $inData["firstname"];
    $lastname = $inData["lastname"];
    $phone = $inData["phone"];
    $email = $inData["email"];
    $userID = $inData["userID"];

    $conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");     
    if( $conn->connect_error )
    {
        returnWithError( $conn->connect_error );
    }
    else
    {

        if(!filter_var($email, FILTER_VALIDATE_EMAIL)){
            returnWithError("Invalid email format");
            exit();
         }

         $formattedPhone = validating($phone);

         if(!$formattedPhone){
             returnWithError("Invalid Phone number format");
             exit();
          }

        $stmt = $conn->prepare("INSERT INTO Contacts (FirstName, LastName, Phone, Email, UserID) VALUES (?,?, ?, ?, ?)");
        $stmt->bind_param("ssssi",$firstname,$lastname, $formattedPhone, $email, $userID);

        if($stmt->execute())
        {
            returnWithInfo("Contact added successfully.");
        }
        else
        {
            returnWithError("Error adding contact: " . $stmt->error);
        }

        $stmt->close();
        $conn->close();
    }

    function validating($phone){

        $result = null;

        $filter = preg_replace('/\D/', '', $phone);

        if(preg_match('/^(\d{3})(\d{3})(\d{4})$/', $filter, $matches)){
            $result = $matches[1] . '-' . $matches[2] . '-' . $matches[3];
        }

        return $result;

    }

    function getRequestInfo()
    {
        return json_decode(file_get_contents('php://input'), true);
    }

    function sendResultInfoAsJson( $obj )
    {
        header('Content-type: application/json');
        echo $obj;
    }
    
    function returnWithError( $err )
    {
        $retValue = '{"error":"' . $err . '"}';
        sendResultInfoAsJson( $retValue );
    }
    
    function returnWithInfo( $info )
    {
        $retValue = '{"result":"' . $info .'","error":""}';
        sendResultInfoAsJson( $retValue );
    }
    
?>
